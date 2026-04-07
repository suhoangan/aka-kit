#!/usr/bin/env node

/**
 * Download assets from Figma REST API using FIGMA_ACCESS_TOKEN.
 *
 * Strategy: File-level cache to minimize API calls (critical for free-tier limits).
 *   - First run for a Figma file: downloads ALL original images + caches everything
 *   - Subsequent runs for same file: 0 API calls for originals, reuses cache
 *
 * Cache: ./output/.figma-cache/{fileKey}/
 *   image-refs.json   — /v1/files/:key/images response (imageRef → S3 URL)
 *   originals/         — downloaded original images keyed by imageRef
 *   node-trees/        — cached node trees by nodeId
 *   exports/           — cached render export URLs by nodeId
 *
 * Modes:
 *   1. Figma API mode (--file-key + --node-id):
 *      Fetches node tree, identifies image children, exports & downloads.
 *   2. URL mode (--assets): Downloads from pre-built URLs (backward compat).
 *
 * Flags:
 *   --no-cache          Force re-download, ignore cache
 *
 * Usage:
 *   node download-figma-assets.cjs \
 *     --file-key abc123 --node-id 0:7050 \
 *     --output ./output/hero-banner/assets
 *
 * Env: FIGMA_ACCESS_TOKEN (required for Figma API mode)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/* ================================================================
 * ENV + CLI
 * ================================================================ */

function loadEnv() {
  var envPaths = [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../../../../.env')
  ];
  for (var i = 0; i < envPaths.length; i++) {
    if (fs.existsSync(envPaths[i])) {
      var lines = fs.readFileSync(envPaths[i], 'utf-8').split('\n');
      lines.forEach(function (line) {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        var eqIdx = line.indexOf('=');
        if (eqIdx <= 0) return;
        var key = line.substring(0, eqIdx).trim();
        var val = line.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      });
      return;
    }
  }
}
loadEnv();

function parseArgs() {
  var args = process.argv.slice(2);
  var parsed = {
    output: '',
    fileKey: '',
    nodeId: '',
    mobileNodeId: '',
    noCache: false,
    modules: '',
    includeInstances: false,
    assets: {},
    icons: [],
    images: []
  };

  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      parsed.output = args[++i];
    } else if (args[i] === '--file-key' && args[i + 1]) {
      parsed.fileKey = args[++i];
    } else if (args[i] === '--node-id' && args[i + 1]) {
      parsed.nodeId = args[++i];
    } else if (args[i] === '--mobile-node-id' && args[i + 1]) {
      parsed.mobileNodeId = args[++i];
    } else if (args[i] === '--no-cache') {
      parsed.noCache = true;
    } else if (args[i] === '--modules' && args[i + 1]) {
      parsed.modules = args[++i];
    } else if (args[i] === '--include-instances') {
      parsed.includeInstances = true;
    } else if (args[i] === '--assets' && args[i + 1]) {
      var pairs = args[++i].split(',');
      pairs.forEach(function (pair) {
        var eqIdx = pair.indexOf('=');
        if (eqIdx > 0) {
          parsed.assets[pair.substring(0, eqIdx).trim()] = pair.substring(eqIdx + 1).trim();
        }
      });
    } else if (args[i] === '--icons' && args[i + 1]) {
      parsed.icons = args[++i].split(',').map(function (s) { return s.trim(); });
    } else if (args[i] === '--images' && args[i + 1]) {
      parsed.images = args[++i].split(',').map(function (s) { return s.trim(); });
    }
  }
  return parsed;
}

/* ================================================================
 * HTTP helpers with retry
 * ================================================================ */

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function fetchJsonOnce(url, headers) {
  return new Promise(function (resolve, reject) {
    var urlObj = new URL(url);
    var options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: headers || {}
    };
    https.get(options, function (res) {
      var data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        if (res.statusCode === 429 || res.statusCode >= 500) {
          var err = new Error('HTTP ' + res.statusCode + ': ' + data.substring(0, 200));
          err.statusCode = res.statusCode;
          err.retryAfter = parseInt(res.headers['retry-after'], 10) || 0;
          reject(err);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode + ': ' + data.substring(0, 200)));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

/* Max wait per retry: 120s. If Retry-After exceeds this, the token is locked out — fail fast. */
var MAX_RETRY_WAIT_SEC = 120;

async function fetchJson(url, headers, maxRetries) {
  maxRetries = maxRetries || 6;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchJsonOnce(url, headers);
    } catch (err) {
      /* Retry on 429 using Retry-After header (per Figma docs) */
      if (err.statusCode === 429) {
        var retryAfterSec = err.retryAfter || 1;
        if (retryAfterSec > MAX_RETRY_WAIT_SEC) {
          console.error('[RATE LIMIT] Retry-After: ' + retryAfterSec + 's exceeds max wait (' + MAX_RETRY_WAIT_SEC + 's). Token may be locked out.');
          throw err;
        }
        if (attempt === maxRetries) throw err;
        console.log('[RATE LIMIT] 429 — waiting ' + retryAfterSec + 's (attempt ' + (attempt + 1) + '/' + maxRetries + ')...');
        await sleep(retryAfterSec * 1000);
        continue;
      }
      var isRetryable = err.statusCode >= 500 && err.statusCode < 600;
      if (!isRetryable || attempt === maxRetries) throw err;
      var delay = 2000 * Math.pow(2, attempt);
      console.log('Server error (HTTP ' + err.statusCode + '), retry in ' + Math.round(delay / 1000) + 's (' + (attempt + 1) + '/' + maxRetries + ')...');
      await sleep(delay);
    }
  }
}

function downloadFileOnce(url, destPath) {
  return new Promise(function (resolve, reject) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    var protocol = url.startsWith('https') ? https : http;
    protocol.get(url, function (response) {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFileOnce(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode === 429 || response.statusCode >= 500) {
        var err = new Error('HTTP ' + response.statusCode + ' for ' + url);
        err.statusCode = response.statusCode;
        err.retryAfter = parseInt(response.headers['retry-after'], 10) || 0;
        response.resume();
        reject(err);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error('HTTP ' + response.statusCode + ' for ' + url));
        return;
      }
      var file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', function () { file.close(); resolve(destPath); });
      file.on('error', function (err) { fs.unlink(destPath, function () {}); reject(err); });
    }).on('error', reject);
  });
}

async function downloadFile(url, destPath, maxRetries) {
  maxRetries = maxRetries || 6;
  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await downloadFileOnce(url, destPath);
    } catch (err) {
      if (err.statusCode === 429) {
        var retryAfterSec = err.retryAfter || 1;
        if (retryAfterSec > MAX_RETRY_WAIT_SEC) {
          console.error('[RATE LIMIT] Retry-After: ' + retryAfterSec + 's exceeds max wait. Token locked out.');
          throw err;
        }
        if (attempt === maxRetries) throw err;
        console.log('[RATE LIMIT] 429 — waiting ' + retryAfterSec + 's for download (attempt ' + (attempt + 1) + '/' + maxRetries + ')...');
        await sleep(retryAfterSec * 1000);
        continue;
      }
      var isRetryable = err.statusCode >= 500 && err.statusCode < 600;
      if (!isRetryable || attempt === maxRetries) throw err;
      var delay = 1000 * Math.pow(2, attempt);
      console.log('Download server error, retry in ' + Math.round(delay / 1000) + 's...');
      await sleep(delay);
    }
  }
}

/* ================================================================
 * File-level cache helpers
 * ================================================================ */

/* Cache dir: ./output/.figma-cache/{fileKey}/ */
function getCacheDir(fileKey) {
  return path.resolve(process.cwd(), 'output', '.figma-cache', fileKey);
}

/* Read JSON from cache, return null if missing */
function cacheRead(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) { /* corrupt cache, ignore */ }
  return null;
}

/* Write JSON to cache */
function cacheWrite(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* Check if a cached file exists and is non-empty */
function cacheFileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

/* Copy cached file to dest, return true if successful */
function cacheCopyTo(cachedPath, destPath) {
  if (!cacheFileExists(cachedPath)) return false;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(cachedPath, destPath);
  return true;
}

/* ================================================================
 * Node tree helpers (unchanged)
 * ================================================================ */

function collectImageNodes(node, collected) {
  collected = collected || [];
  var fills = node.fills || [];
  for (var f = 0; f < fills.length; f++) {
    if (fills[f].type === 'IMAGE' && fills[f].imageRef) {
      collected.push({
        id: node.id,
        name: toKebab(node.name || 'image'),
        type: classifyByName(node.name || ''),
        imageRef: fills[f].imageRef
      });
      break;
    }
  }
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    collectImageNodes(children[i], collected);
  }
  return collected;
}

function collectVectorNodes(node, collected, depth, imageFillIds) {
  collected = collected || [];
  depth = depth || 0;
  imageFillIds = imageFillIds || new Set();

  if (depth > 0) {
    if (imageFillIds.has(node.id)) return collected;

    var isVector = ['VECTOR', 'BOOLEAN_OPERATION', 'LINE', 'STAR', 'POLYGON', 'ELLIPSE', 'RECTANGLE', 'REGULAR_POLYGON'].indexOf(node.type) >= 0;
    var isComponent = node.type === 'COMPONENT' || node.type === 'INSTANCE';
    var isGroupOrFrame = node.type === 'GROUP' || node.type === 'FRAME';

    var fills = node.fills || [];
    var hasImageFill = fills.some(function (f) { return f.type === 'IMAGE'; });
    if (hasImageFill) {
      var children = node.children || [];
      for (var i = 0; i < children.length; i++) {
        collectVectorNodes(children[i], collected, depth + 1, imageFillIds);
      }
      return collected;
    }

    if (isVector) {
      collected.push({ id: node.id, name: toKebab(node.name || 'vector'), type: 'icon' });
      return collected;
    }

    if (isComponent) {
      var compHasText = hasTextDescendant(node);
      var compSize = getNodeSize(node);
      if (isSvgWorthyName(node.name) || (!compHasText && compSize.maxDim <= 300)) {
        collected.push({ id: node.id, name: toKebab(node.name || 'component'), type: 'icon' });
        return collected;
      }
    }

    if (isGroupOrFrame) {
      var frameSize = getNodeSize(node);
      var frameHasText = hasTextDescendant(node);
      var frameHasVectors = hasVectorDescendant(node);

      if (frameHasVectors && !frameHasText && frameSize.maxDim <= 300 && frameSize.maxDim > 0) {
        collected.push({ id: node.id, name: toKebab(node.name || 'graphic'), type: 'icon' });
        return collected;
      }
      if (isSvgWorthyName(node.name) && !frameHasText) {
        collected.push({ id: node.id, name: toKebab(node.name || 'graphic'), type: 'icon' });
        return collected;
      }
    }
  }

  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    collectVectorNodes(children[i], collected, depth + 1, imageFillIds);
  }
  return collected;
}

function isSvgWorthyName(name) {
  return !!(name || '').toLowerCase().match(/^(logo|icon|arrow|chevron|check|dot|close|menu|search|star|play|badge|shape|decoration|divider|separator|ornament|graphic|symbol|vector|svg|illustration|pattern)/);
}

function hasTextDescendant(node) {
  if (node.type === 'TEXT') return true;
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    if (hasTextDescendant(children[i])) return true;
  }
  return false;
}

function hasVectorDescendant(node) {
  var vectorTypes = ['VECTOR', 'BOOLEAN_OPERATION', 'LINE', 'STAR', 'POLYGON', 'ELLIPSE', 'RECTANGLE', 'REGULAR_POLYGON'];
  if (vectorTypes.indexOf(node.type) >= 0) return true;
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    if (hasVectorDescendant(children[i])) return true;
  }
  return false;
}

function getNodeSize(node) {
  var w = 0, h = 0;
  if (node.absoluteBoundingBox) {
    w = node.absoluteBoundingBox.width || 0;
    h = node.absoluteBoundingBox.height || 0;
  } else if (node.size) {
    w = node.size.x || 0;
    h = node.size.y || 0;
  }
  return { width: w, height: h, maxDim: Math.max(w, h) };
}

function classifyByName(name) {
  if (name.toLowerCase().match(/^(logo|icon|arrow|chevron|check|dot|close|menu|search|star|play|badge|shape|decoration|divider|separator|ornament|graphic|symbol|vector|svg|illustration|pattern)/)) {
    return 'icon';
  }
  return 'image';
}

function toKebab(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ================================================================
 * Download with skip + manifest
 * ================================================================ */

async function downloadWithSkip(url, destPath, label, results) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    results.push({ name: label, path: destPath, status: 'skipped' });
    console.log('SKIP: ' + label + ' (exists)');
    return;
  }
  try {
    await downloadFile(url, destPath);
    results.push({ name: label, path: destPath, status: 'ok' });
    console.log('OK: ' + label);
  } catch (err) {
    results.push({ name: label, path: destPath, status: 'error', error: err.message });
    console.error('FAIL: ' + label + ' → ' + err.message);
  }
}

function writeManifest(outputDir, results) {
  var ok = results.filter(function (r) { return r.status === 'ok'; }).length;
  var skipped = results.filter(function (r) { return r.status === 'skipped'; }).length;
  var fail = results.filter(function (r) { return r.status === 'error'; }).length;
  console.log('\nDone: ' + ok + ' downloaded, ' + skipped + ' skipped, ' + fail + ' failed');
  var manifest = path.join(outputDir, 'assets-manifest.json');
  fs.writeFileSync(manifest, JSON.stringify(results, null, 2));
  console.log('Manifest: ' + manifest);
}

/* ================================================================
 * Figma API mode — file-level cache strategy
 *
 * API calls breakdown:
 *   First run for a file:  3-4 calls (node tree + originals + SVG + PNG)
 *   Same component again:  0 calls (everything cached)
 *   New component, same file: 3 calls (node tree + SVG + PNG — originals cached)
 *
 * ================================================================ */

async function figmaApiMode(config) {
  var token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    console.error('Error: FIGMA_ACCESS_TOKEN environment variable is required');
    process.exit(1);
  }

  var headers = { 'X-Figma-Token': token };
  var fileKey = config.fileKey;
  var nodeId = config.nodeId;
  var useCache = !config.noCache;
  var apiCallCount = 0;

  /* Set up cache + output dirs */
  var cache = getCacheDir(fileKey);
  var cacheOriginalsDir = path.join(cache, 'originals');
  var cacheNodeTreesDir = path.join(cache, 'node-trees');
  var cacheExportsDir = path.join(cache, 'exports');
  var imageRefsPath = path.join(cache, 'image-refs.json');

  var iconsDir = path.join(config.output, 'icons');
  var imagesDir = path.join(config.output, 'images');
  var designDir = path.resolve(config.output, '..', 'design');
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(designDir, { recursive: true });
  fs.mkdirSync(cacheOriginalsDir, { recursive: true });
  fs.mkdirSync(cacheNodeTreesDir, { recursive: true });
  fs.mkdirSync(cacheExportsDir, { recursive: true });

  /* === STEP 1: Get node tree (cached by nodeId) === */
  var safeNodeId = nodeId.replace(/:/g, '-');
  var cachedTreePath = path.join(cacheNodeTreesDir, safeNodeId + '.json');
  var rootNode;

  if (useCache && cacheFileExists(cachedTreePath)) {
    console.log('[CACHE HIT] Node tree for ' + nodeId);
    rootNode = cacheRead(cachedTreePath);
  } else {
    console.log('[API] Fetching node tree for ' + nodeId + '...');
    var nodesUrl = 'https://api.figma.com/v1/files/' + fileKey + '/nodes?ids=' + encodeURIComponent(nodeId);
    var nodesData = await fetchJson(nodesUrl, headers);
    apiCallCount++;

    if (!nodesData.nodes || !nodesData.nodes[nodeId]) {
      console.error('Error: Node ' + nodeId + ' not found');
      process.exit(1);
    }
    rootNode = nodesData.nodes[nodeId].document;
    cacheWrite(cachedTreePath, rootNode);
  }

  console.log('Root node: ' + rootNode.name + ' (' + rootNode.type + ')');

  /* Also save node tree to output for design token extraction */
  var outputTreePath = path.join(path.resolve(config.output, '..'), 'node-tree.json');
  fs.mkdirSync(path.dirname(outputTreePath), { recursive: true });
  fs.writeFileSync(outputTreePath, JSON.stringify(rootNode, null, 2));

  /* Collect image fill nodes + vector/SVG nodes */
  var imageFillNodes = collectImageNodes(rootNode);
  var imageFillIds = new Set(imageFillNodes.map(function (n) { return n.id; }));
  var vectorIconNodes = collectVectorNodes(rootNode, [], 0, imageFillIds);
  console.log('Found ' + imageFillNodes.length + ' image fills, ' + vectorIconNodes.length + ' SVG-exportable nodes');

  var results = [];

  /* === STEP 2: Get original images (cached per file, not per node) === */
  var imageFillsWithRef = imageFillNodes.filter(function (n) { return n.imageRef; });
  var imageRefMap = null;

  if (imageFillsWithRef.length > 0) {
    /* Try cache first */
    if (useCache) {
      imageRefMap = cacheRead(imageRefsPath);
      if (imageRefMap) {
        console.log('[CACHE HIT] Image refs map (' + Object.keys(imageRefMap).length + ' entries)');
      }
    }

    /* Cache miss → 1 API call to get ALL originals for the entire file */
    if (!imageRefMap) {
      console.log('[API] Fetching ALL original images for file ' + fileKey + '...');
      try {
        var fillsUrl = 'https://api.figma.com/v1/files/' + fileKey + '/images';
        var fillsData = await fetchJson(fillsUrl, headers);
        apiCallCount++;
        imageRefMap = (fillsData.meta && fillsData.meta.images) || {};
        cacheWrite(imageRefsPath, imageRefMap);
        console.log('Cached ' + Object.keys(imageRefMap).length + ' image refs for file');
      } catch (err) {
        console.error('WARN: Image refs fetch failed → ' + err.message);
        imageRefMap = {};
      }
    }

    /* Download originals — check cache first, then download + cache */
    for (var i = 0; i < imageFillsWithRef.length; i++) {
      var fillNode = imageFillsWithRef[i];
      var originalUrl = imageRefMap[fillNode.imageRef];

      if (!originalUrl) {
        console.log('WARN: No original for ' + fillNode.name + ' (ref: ' + fillNode.imageRef + ')');
        continue;
      }

      /* Determine extension */
      var ext = '.png';
      if (originalUrl.match(/\.svg/i)) ext = '.svg';
      else if (originalUrl.match(/\.jpg|\.jpeg/i)) ext = '.jpg';
      else if (originalUrl.match(/\.webp/i)) ext = '.webp';

      var dir = fillNode.type === 'icon' ? iconsDir : imagesDir;
      if (ext === '.svg') dir = iconsDir;
      var destPath = path.join(dir, fillNode.name + ext);
      var cachedOriginal = path.join(cacheOriginalsDir, fillNode.imageRef + ext);

      /* Try copy from cache → download to cache + output → download to output */
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        results.push({ name: fillNode.name + ext, path: destPath, status: 'skipped' });
        console.log('SKIP: ' + fillNode.name + ext + ' (exists)');
      } else if (useCache && cacheCopyTo(cachedOriginal, destPath)) {
        results.push({ name: fillNode.name + ext, path: destPath, status: 'ok' });
        console.log('OK (cache): ' + fillNode.name + ext);
      } else {
        /* Download to cache, then copy to output */
        try {
          await downloadFile(originalUrl, cachedOriginal);
          fs.copyFileSync(cachedOriginal, destPath);
          results.push({ name: fillNode.name + ext, path: destPath, status: 'ok' });
          console.log('OK: ' + fillNode.name + ext);
        } catch (err) {
          results.push({ name: fillNode.name + ext, path: destPath, status: 'error', error: err.message });
          console.error('FAIL: ' + fillNode.name + ext + ' → ' + err.message);
        }
      }
      fillNode.downloaded = true;
    }
  }

  /* === STEP 3+4: Batch render exports (SVG + PNG) with per-node caching === */
  var remainingFills = imageFillNodes.filter(function (n) { return !n.downloaded; });
  var iconFills = remainingFills.filter(function (n) { return n.type === 'icon'; });
  var photoFills = remainingFills.filter(function (n) { return n.type === 'image'; });

  /* Deduplicate vector icon names */
  var nameCount = {};
  vectorIconNodes.forEach(function (n) {
    var base = n.name;
    if (nameCount[base] === undefined) { nameCount[base] = 0; }
    else { nameCount[base]++; n.name = base + '-' + nameCount[base]; }
  });

  /* Build SVG list: icon fills + vector nodes */
  var allSvgNodes = [].concat(iconFills, vectorIconNodes);

  /* Build PNG list: photo fills + screenshots */
  var allPngNodes = photoFills.slice();
  allPngNodes.push({ id: nodeId, name: '__screenshot_desktop__', type: 'screenshot' });
  if (config.mobileNodeId) {
    allPngNodes.push({ id: config.mobileNodeId, name: '__screenshot_mobile__', type: 'screenshot' });
  }

  /* Helper: resolve dest path for a node */
  function getDestPath(node, ext) {
    if (node.name === '__screenshot_desktop__') return path.join(designDir, 'desktop.png');
    if (node.name === '__screenshot_mobile__') return path.join(designDir, 'mobile.png');
    if (ext === '.svg') return path.join(iconsDir, node.name + '.svg');
    return path.join(imagesDir, node.name + '.png');
  }

  /* Helper: export batch with cache check — only calls API for uncached nodes */
  async function exportBatch(nodes, format, label) {
    if (nodes.length === 0) return;

    var ext = format === 'svg' ? '.svg' : '.png';
    var uncached = [];

    /* Check which nodes are already cached or already in output */
    for (var n = 0; n < nodes.length; n++) {
      var node = nodes[n];
      var safeId = node.id.replace(/:/g, '-');
      var cachedPath = path.join(cacheExportsDir, safeId + ext);
      var destPath = getDestPath(node, ext);
      var displayName = node.name === '__screenshot_desktop__' ? 'desktop.png (screenshot)'
        : node.name === '__screenshot_mobile__' ? 'mobile.png (screenshot)'
        : node.name + ext;

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
        results.push({ name: displayName, path: destPath, status: 'skipped' });
        console.log('SKIP: ' + displayName + ' (exists)');
      } else if (useCache && cacheCopyTo(cachedPath, destPath)) {
        results.push({ name: displayName, path: destPath, status: 'ok' });
        console.log('OK (cache): ' + displayName);
      } else {
        uncached.push(node);
      }
    }

    if (uncached.length === 0) {
      console.log('[CACHE HIT] All ' + label + ' nodes cached');
      return;
    }

    /* API call for uncached nodes only */
    var ids = uncached.map(function (n) { return n.id; }).join(',');
    var url = 'https://api.figma.com/v1/images/' + fileKey +
      '?ids=' + encodeURIComponent(ids) + '&format=' + format +
      (format === 'png' ? '&scale=2' : '');
    console.log('[API] Exporting ' + uncached.length + ' ' + label + ' nodes...');

    try {
      var data = await fetchJson(url, headers);
      apiCallCount++;
      var images = (data && data.images) || {};

      for (var u = 0; u < uncached.length; u++) {
        var uNode = uncached[u];
        var uUrl = images[uNode.id];
        var uSafeId = uNode.id.replace(/:/g, '-');
        var uCachedPath = path.join(cacheExportsDir, uSafeId + ext);
        var uDestPath = getDestPath(uNode, ext);
        var uDisplayName = uNode.name === '__screenshot_desktop__' ? 'desktop.png (screenshot)'
          : uNode.name === '__screenshot_mobile__' ? 'mobile.png (screenshot)'
          : uNode.name + ext;

        if (!uUrl) {
          results.push({ name: uDisplayName, status: 'error', error: 'No export URL' });
          continue;
        }

        try {
          /* Download to cache, then copy to output */
          await downloadFile(uUrl, uCachedPath);
          fs.mkdirSync(path.dirname(uDestPath), { recursive: true });
          fs.copyFileSync(uCachedPath, uDestPath);
          results.push({ name: uDisplayName, path: uDestPath, status: 'ok' });
          console.log('OK: ' + uDisplayName);
        } catch (err) {
          results.push({ name: uDisplayName, status: 'error', error: err.message });
          console.error('FAIL: ' + uDisplayName + ' → ' + err.message);
        }
      }
    } catch (err) {
      console.error('FAIL: ' + label + ' export → ' + err.message);
      uncached.forEach(function (n) {
        var name = n.name.startsWith('__screenshot_') ? n.name.replace(/__/g, '') : n.name + ext;
        results.push({ name: name, status: 'error', error: err.message });
      });
    }
  }

  await exportBatch(allSvgNodes, 'svg', 'SVG');
  /* Delay between export batches to avoid Figma API rate limit (429) */
  if (allSvgNodes.length > 0 && allPngNodes.length > 0) {
    console.log('[RATE LIMIT] Waiting 10s before PNG export...');
    await sleep(10000);
  }
  await exportBatch(allPngNodes, 'png', 'PNG');

  console.log('\nFigma API calls used: ' + apiCallCount + (useCache ? ' (cache enabled)' : ' (cache disabled)'));
  writeManifest(config.output, results);
  return results;
}

/* ================================================================
 * URL mode (legacy)
 * ================================================================ */

async function urlMode(config) {
  var iconsDir = path.join(config.output, 'icons');
  var imagesDir = path.join(config.output, 'images');
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  var iconSet = new Set(config.icons);
  var imageSet = new Set(config.images);
  var results = [];
  var names = Object.keys(config.assets);

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var url = config.assets[name];
    var isIcon = iconSet.has(name);
    var ext = isIcon ? '.svg' : '.webp';
    var dir = isIcon ? iconsDir : imagesDir;

    if (!isIcon && !imageSet.has(name)) {
      if (name.match(/^(logo|icon|arrow|chevron|check|dot)/i)) {
        ext = '.svg'; dir = iconsDir;
      } else {
        ext = '.webp'; dir = imagesDir;
      }
    }

    await downloadWithSkip(url, path.join(dir, name + ext), name + ext, results);
  }

  writeManifest(config.output, results);
  return results;
}

/* ================================================================
 * Main
 * ================================================================ */

/**
 * kebab-case a string for folder names
 */
function toKebab(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Batch mode: read page-module-map.json, download assets for each module
 */
async function batchMode(config) {
  var mapPath = path.resolve(config.modules);
  if (!fs.existsSync(mapPath)) {
    console.error('Error: modules file not found: ' + mapPath);
    process.exit(1);
  }
  var map = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  if (!map.desktop || !map.desktop.modules) {
    console.error('Error: no desktop modules in map');
    process.exit(1);
  }

  var fileKey = map.fileKey || config.fileKey;
  if (!fileKey) { console.error('Error: no fileKey'); process.exit(1); }

  var modules = map.desktop.modules.filter(function (m) {
    if (!config.includeInstances && m.type === 'INSTANCE') return false;
    return true;
  });

  console.log('Batch: ' + modules.length + ' modules to download (skipping INSTANCE types)');
  console.log('');

  for (var i = 0; i < modules.length; i++) {
    var mod = modules[i];
    var slug = toKebab(mod.name);
    var outputDir = path.resolve(path.dirname(mapPath), slug, 'assets');

    /* Find mobile node from mapping */
    var mobileId = '';
    if (map.mapping) {
      var entry = map.mapping.find(function (e) { return e.desktopId === mod.id; });
      if (entry && entry.mobileId) mobileId = entry.mobileId;
    }

    console.log('--- [' + (i + 1) + '/' + modules.length + '] ' + mod.name + ' (' + mod.id + ') ---');
    var batchConfig = {
      output: outputDir,
      fileKey: fileKey,
      nodeId: mod.id,
      mobileNodeId: mobileId,
      noCache: config.noCache
    };
    await figmaApiMode(batchConfig);
    console.log('');
  }

  console.log('Batch complete: ' + modules.length + ' modules downloaded');
}

async function main() {
  var config = parseArgs();

  /* Batch mode: --modules path/to/page-module-map.json */
  if (config.modules) {
    await batchMode(config);
    return;
  }

  if (!config.output) {
    console.error('Error: --output is required');
    process.exit(1);
  }

  if (config.fileKey && config.nodeId) {
    await figmaApiMode(config);
    return;
  }

  if (Object.keys(config.assets).length > 0) {
    await urlMode(config);
    return;
  }

  console.error('Error: provide --file-key + --node-id, --modules, or --assets');
  process.exit(1);
}

main();
