#!/usr/bin/env node

/**
 * List all modules/frames in a Figma file page.
 *
 * Fetches the full page structure from Figma REST API and outputs:
 *   - page-module-map.json (structured data)
 *   - page-module-map.md   (human-readable tables)
 *
 * Usage:
 *   node list-figma-modules.cjs \
 *     --file-key VEU6KGNGYCPG2AsOjx0Zv4 \
 *     --output ./output/july-atlassian \
 *     [--page-id "0:1"] \
 *     [--no-cache]
 *
 * Env: FIGMA_ACCESS_TOKEN (required)
 */

const https = require('https');
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
  var parsed = { output: '', fileKey: '', pageId: '', noCache: false };
  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) parsed.output = args[++i];
    else if (args[i] === '--file-key' && args[i + 1]) parsed.fileKey = args[++i];
    else if (args[i] === '--page-id' && args[i + 1]) parsed.pageId = args[++i];
    else if (args[i] === '--no-cache') parsed.noCache = true;
  }
  return parsed;
}

/* ================================================================
 * HTTP + Cache helpers
 * ================================================================ */

function fetchJson(url, headers) {
  return new Promise(function (resolve, reject) {
    var urlObj = new URL(url);
    https.get({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: headers || {}
    }, function (res) {
      var data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode + ': ' + data.substring(0, 200)));
          return;
        }
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

function getCachePath(fileKey) {
  return path.resolve(process.cwd(), 'output', '.figma-cache', fileKey);
}

/* ================================================================
 * Figma API
 * ================================================================ */

async function fetchFileStructure(fileKey, noCache) {
  var cacheDir = getCachePath(fileKey);
  var cacheFile = path.join(cacheDir, 'file-structure.json');

  /* Return cached if exists */
  if (!noCache && fs.existsSync(cacheFile)) {
    console.log('[cache] Using cached file structure');
    return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
  }

  var token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) throw new Error('FIGMA_ACCESS_TOKEN not set');

  console.log('[API] Fetching file structure (depth=4)...');
  var url = 'https://api.figma.com/v1/files/' + fileKey + '?depth=4';
  var result = await fetchJson(url, { 'X-Figma-Token': token });

  /* Cache result */
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2));
  console.log('[cache] Saved file structure');

  return result;
}

/* ================================================================
 * Frame identification
 * ================================================================ */

/** Classify a frame as desktop, mobile, or standalone based on width and name */
function classifyFrame(frame) {
  var bb = frame.absoluteBoundingBox;
  if (!bb) return 'standalone';
  var w = Math.round(bb.width);
  var name = (frame.name || '').toLowerCase();

  if (w >= 1200 && w <= 1600) {
    if (name.includes('mobile') || name.includes('phone')) return 'mobile';
    return 'desktop';
  }
  if (w >= 320 && w <= 430) return 'mobile';
  return 'standalone';
}

/** Extract module list from a container frame */
function extractModules(frame) {
  if (!frame || !frame.children) return [];
  return frame.children.map(function (child) {
    var bb = child.absoluteBoundingBox || {};
    return {
      id: child.id,
      type: child.type,
      name: child.name,
      width: Math.round(bb.width || 0),
      height: Math.round(bb.height || 0)
    };
  });
}

/** Normalize name for fuzzy matching */
function normalizeName(name) {
  return (name || '').toLowerCase()
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/desktop|mobile|tablet|phone/gi, '')
    .trim();
}

/** Map desktop ↔ mobile modules by name similarity */
function mapModules(desktopModules, mobileModules) {
  var mapping = [];
  var usedMobile = new Set();

  desktopModules.forEach(function (dm) {
    var dnorm = normalizeName(dm.name);
    var best = null;
    var bestScore = 0;

    mobileModules.forEach(function (mm) {
      if (usedMobile.has(mm.id)) return;
      var mnorm = normalizeName(mm.name);
      /* Exact match */
      if (dnorm === mnorm) { best = mm; bestScore = 100; return; }
      /* One contains the other */
      if (dnorm.includes(mnorm) || mnorm.includes(dnorm)) {
        var score = Math.min(dnorm.length, mnorm.length) / Math.max(dnorm.length, mnorm.length) * 80;
        if (score > bestScore) { best = mm; bestScore = score; }
      }
    });

    mapping.push({
      name: dm.name,
      desktopId: dm.id,
      mobileId: best && bestScore >= 30 ? best.id : null,
      mobileName: best && bestScore >= 30 ? best.name : null
    });

    if (best && bestScore >= 30) usedMobile.add(best.id);
  });

  return mapping;
}

/* ================================================================
 * Output generators
 * ================================================================ */

function kebabCase(str) {
  return (str || '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateJson(data) {
  return JSON.stringify(data, null, 2);
}

function generateMarkdown(data) {
  var lines = [];
  lines.push('# ' + data.fileName + ' — Page Module Map');
  lines.push('');
  lines.push('**Figma file key:** `' + data.fileKey + '`');
  lines.push('**Page:** ' + data.page.name + ' (`' + data.page.id + '`)');
  if (data.section) {
    lines.push('**Section:** ' + data.section.name + ' (`' + data.section.id + '`, ' + data.section.width + '×' + data.section.height + ')');
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  /* Desktop */
  if (data.desktop) {
    lines.push('## Desktop (`' + data.desktop.id + '`, ' + data.desktop.width + '×' + data.desktop.height + ')');
    lines.push('');
    lines.push('| # | Node ID | Type | Module Name | Size |');
    lines.push('|---|---------|------|-------------|------|');
    data.desktop.modules.forEach(function (m, i) {
      lines.push('| ' + (i + 1) + ' | `' + m.id + '` | ' + m.type + ' | ' + m.name + ' | ' + m.width + '×' + m.height + ' |');
    });
    lines.push('');
  }

  /* Mobile */
  if (data.mobile) {
    lines.push('## Mobile (`' + data.mobile.id + '`, ' + data.mobile.width + '×' + data.mobile.height + ')');
    lines.push('');
    lines.push('| # | Node ID | Type | Module Name | Size |');
    lines.push('|---|---------|------|-------------|------|');
    data.mobile.modules.forEach(function (m, i) {
      lines.push('| ' + (i + 1) + ' | `' + m.id + '` | ' + m.type + ' | ' + m.name + ' | ' + m.width + '×' + m.height + ' |');
    });
    lines.push('');
  }

  /* Mapping */
  if (data.mapping && data.mapping.length > 0) {
    lines.push('## Desktop ↔ Mobile Mapping');
    lines.push('');
    lines.push('| Module | Desktop Node | Mobile Node |');
    lines.push('|--------|-------------|-------------|');
    data.mapping.forEach(function (m) {
      var mobile = m.mobileId ? '`' + m.mobileId + '`' + (m.mobileName !== m.name ? ' (' + m.mobileName + ')' : '') : '—';
      lines.push('| ' + m.name + ' | `' + m.desktopId + '` | ' + mobile + ' |');
    });
    lines.push('');
  }

  /* Standalone */
  if (data.standalone && data.standalone.length > 0) {
    lines.push('## Standalone Frames');
    lines.push('');
    lines.push('| Node ID | Name | Size |');
    lines.push('|---------|------|------|');
    data.standalone.forEach(function (f) {
      lines.push('| `' + f.id + '` | ' + f.name + ' | ' + f.width + '×' + f.height + ' |');
    });
    lines.push('');
  }

  return lines.join('\n');
}

/* ================================================================
 * Main
 * ================================================================ */

async function main() {
  var args = parseArgs();
  if (!args.fileKey) {
    console.error('Usage: node list-figma-modules.cjs --file-key <key> --output <dir>');
    process.exit(1);
  }
  if (!args.output) {
    args.output = path.resolve(process.cwd(), 'output', args.fileKey);
  }

  var file = await fetchFileStructure(args.fileKey, args.noCache);

  /* Find page */
  var page = null;
  if (args.pageId) {
    page = file.document.children.find(function (p) { return p.id === args.pageId; });
  }
  if (!page) page = file.document.children[0];
  if (!page) { console.error('No pages found'); process.exit(1); }

  /* Find section or use page directly */
  var container = page;
  var sectionInfo = null;
  if (page.children && page.children.length === 1 && page.children[0].type === 'SECTION') {
    container = page.children[0];
    var sbb = container.absoluteBoundingBox || {};
    sectionInfo = {
      id: container.id,
      name: container.name,
      width: Math.round(sbb.width || 0),
      height: Math.round(sbb.height || 0)
    };
  }

  /* Classify children into desktop / mobile / standalone */
  var desktopFrame = null;
  var mobileFrame = null;
  var standalone = [];

  (container.children || []).forEach(function (child) {
    var cls = classifyFrame(child);
    var bb = child.absoluteBoundingBox || {};

    if (cls === 'desktop' && !desktopFrame) {
      /* Pick the tallest desktop frame (main page, not banners) */
      if (!desktopFrame || (bb.height || 0) > (desktopFrame.absoluteBoundingBox || {}).height) {
        desktopFrame = child;
      }
    } else if (cls === 'mobile' && !mobileFrame) {
      if (!mobileFrame || (bb.height || 0) > (mobileFrame.absoluteBoundingBox || {}).height) {
        mobileFrame = child;
      }
    } else {
      standalone.push({
        id: child.id,
        type: child.type,
        name: child.name,
        width: Math.round(bb.width || 0),
        height: Math.round(bb.height || 0)
      });
    }
  });

  /* Extract modules */
  var desktopModules = extractModules(desktopFrame);
  var mobileModules = extractModules(mobileFrame);
  var mapping = mapModules(desktopModules, mobileModules);

  /* Build output data */
  var dbb = desktopFrame ? (desktopFrame.absoluteBoundingBox || {}) : {};
  var mbb = mobileFrame ? (mobileFrame.absoluteBoundingBox || {}) : {};

  var data = {
    fileKey: args.fileKey,
    fileName: file.name || 'Untitled',
    page: { id: page.id, name: page.name },
    section: sectionInfo,
    desktop: desktopFrame ? {
      id: desktopFrame.id,
      name: desktopFrame.name,
      width: Math.round(dbb.width || 0),
      height: Math.round(dbb.height || 0),
      modules: desktopModules
    } : null,
    mobile: mobileFrame ? {
      id: mobileFrame.id,
      name: mobileFrame.name,
      width: Math.round(mbb.width || 0),
      height: Math.round(mbb.height || 0),
      modules: mobileModules
    } : null,
    mapping: mapping,
    standalone: standalone
  };

  /* Write output */
  fs.mkdirSync(args.output, { recursive: true });
  var jsonPath = path.join(args.output, 'page-module-map.json');
  var mdPath = path.join(args.output, 'page-module-map.md');

  fs.writeFileSync(jsonPath, generateJson(data));
  fs.writeFileSync(mdPath, generateMarkdown(data));

  /* Summary */
  console.log('');
  console.log('=== Page Module Map ===');
  console.log('File:     ' + data.fileName);
  console.log('Page:     ' + data.page.name);
  if (data.section) console.log('Section:  ' + data.section.name);
  if (data.desktop) console.log('Desktop:  ' + data.desktop.name + ' (' + desktopModules.length + ' modules)');
  if (data.mobile) console.log('Mobile:   ' + data.mobile.name + ' (' + mobileModules.length + ' modules)');
  console.log('Standalone: ' + standalone.length + ' frames');
  console.log('');
  console.log('JSON: ' + jsonPath);
  console.log('MD:   ' + mdPath);
}

main().catch(function (err) {
  console.error('Error:', err.message);
  process.exit(1);
});
