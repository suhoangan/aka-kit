#!/usr/bin/env node

/**
 * Visual diff: render component HTML via Puppeteer, compare with Figma design screenshot.
 *
 * Steps:
 *   1. Launch headless browser, open component.html
 *   2. Screenshot at specified viewport size → rendered.png
 *   3. Compare rendered.png vs design.png using pixelmatch
 *   4. Output diff.png (red overlay) + match percentage
 *
 * Usage:
 *   npx puppeteer browsers install chrome  # first time only
 *   node visual-diff.js \
 *     --component ./output/hero-banner/component/component.html \
 *     --design ./output/hero-banner/design/desktop.png \
 *     --output ./output/hero-banner/design \
 *     --width 1440
 *
 * Outputs:
 *   {output}/rendered.png  — screenshot of component
 *   {output}/diff.png      — pixel diff overlay
 *   {output}/diff-report.json — match stats
 */

var fs = require('fs');
var path = require('path');

/* --- Parse CLI arguments --- */
function parseArgs() {
  var args = process.argv.slice(2);
  var parsed = {
    component: '',
    design: '',
    output: '',
    width: 1440,
    height: 0, /* 0 = auto from design image or full page */
    threshold: 0.1, /* pixelmatch sensitivity: 0 = exact, 1 = lenient */
    fonts: '', /* path to design-tokens.json or Google Fonts URL */
    prefix: '' /* output file prefix, e.g. "mobile-" for mobile test */
  };

  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--component' && args[i + 1]) parsed.component = args[++i];
    else if (args[i] === '--design' && args[i + 1]) parsed.design = args[++i];
    else if (args[i] === '--output' && args[i + 1]) parsed.output = args[++i];
    else if (args[i] === '--width' && args[i + 1]) parsed.width = parseInt(args[++i], 10);
    else if (args[i] === '--height' && args[i + 1]) parsed.height = parseInt(args[++i], 10);
    else if (args[i] === '--threshold' && args[i + 1]) parsed.threshold = parseFloat(args[++i]);
    else if (args[i] === '--fonts' && args[i + 1]) parsed.fonts = args[++i];
    else if (args[i] === '--prefix' && args[i + 1]) parsed.prefix = args[++i];
  }

  return parsed;
}

/* --- Read PNG dimensions from header (avoid dependency for this) --- */
function readPngDimensions(filePath) {
  var buf = fs.readFileSync(filePath);
  /* PNG header: bytes 16-19 = width, 20-23 = height (big-endian) */
  if (buf[0] !== 0x89 || buf[1] !== 0x50) {
    return null; /* not a PNG */
  }
  var width = buf.readUInt32BE(16);
  var height = buf.readUInt32BE(20);
  return { width: width, height: height };
}

/* --- Inject fonts into page from design-tokens.json or Google Fonts URL --- */
async function injectFonts(page, fontsArg) {
  /* If it's a URL, inject as stylesheet link */
  if (fontsArg.startsWith('http')) {
    console.log('Injecting font URL: ' + fontsArg);
    await page.addStyleTag({ url: fontsArg });
    return;
  }

  /* If it's a JSON file (design-tokens.json), extract font families and load from Google Fonts */
  var fontsPath = path.resolve(fontsArg);
  if (fs.existsSync(fontsPath)) {
    try {
      var tokens = JSON.parse(fs.readFileSync(fontsPath, 'utf-8'));
      var fonts = tokens.fonts || [];
      if (fonts.length === 0) {
        console.log('No fonts found in design tokens');
        return;
      }

      /* Build Google Fonts URL */
      var families = fonts.map(function (f) {
        var weights = f.weights && f.weights.length > 0 ? f.weights.join(';') : '400';
        return 'family=' + encodeURIComponent(f.family) + ':wght@' + weights;
      });
      var googleUrl = 'https://fonts.googleapis.com/css2?' + families.join('&') + '&display=swap';
      console.log('Injecting Google Fonts: ' + fonts.map(function (f) { return f.family; }).join(', '));
      await page.addStyleTag({ url: googleUrl });
    } catch (e) {
      console.error('WARN: Failed to parse fonts from ' + fontsPath + ': ' + e.message);
    }
    return;
  }

  console.error('WARN: Fonts file not found: ' + fontsPath);
}

/* --- Main --- */
async function main() {
  var config = parseArgs();

  if (!config.component) {
    console.error('Error: --component is required');
    process.exit(1);
  }
  if (!config.design) {
    console.error('Error: --design is required');
    process.exit(1);
  }
  if (!config.output) {
    config.output = path.dirname(config.design);
  }

  /* Resolve absolute paths */
  config.component = path.resolve(config.component);
  config.design = path.resolve(config.design);
  config.output = path.resolve(config.output);
  fs.mkdirSync(config.output, { recursive: true });

  if (!fs.existsSync(config.component)) {
    console.error('Error: Component not found: ' + config.component);
    process.exit(1);
  }
  if (!fs.existsSync(config.design)) {
    console.error('Error: Design screenshot not found: ' + config.design);
    process.exit(1);
  }

  /* Get design image dimensions to match viewport */
  var designDims = readPngDimensions(config.design);
  if (designDims) {
    console.log('Design dimensions: ' + designDims.width + 'x' + designDims.height);
    /* Use design width if close to config width (within 2x for retina) */
    if (config.height === 0) {
      /* Figma screenshots at scale=2 are 2x, so real height = designDims.height / 2 */
      config.height = Math.ceil(designDims.height / 2);
    }
  }
  if (config.height === 0) config.height = 900; /* fallback */

  console.log('Viewport: ' + config.width + 'x' + config.height);

  /* --- Step 1: Screenshot component with Puppeteer --- */
  console.log('Launching browser...');
  var skillsNodeModules = path.resolve(__dirname, '../../../node_modules');
  var puppeteer;
  try {
    puppeteer = require(path.join(skillsNodeModules, 'puppeteer'));
  } catch (e) {
    try {
      puppeteer = require('puppeteer');
    } catch (e2) {
      var execSync = require('child_process').execSync;
      console.log('Installing dependencies (npm)...');
      execSync('npm install puppeteer pngjs pixelmatch --no-save', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        shell: true,
      });
      puppeteer = require(path.join(skillsNodeModules, 'puppeteer'));
    }
  }

  var browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  var page = await browser.newPage();
  await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: 2 });

  var fileUrl = 'file://' + config.component;
  console.log('Opening: ' + fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });

  /* Inject fonts if --fonts provided */
  if (config.fonts) {
    await injectFonts(page, config.fonts);
  }

  /* Wait for fonts/images to load */
  await page.evaluate(function () {
    return document.fonts ? document.fonts.ready : Promise.resolve();
  });
  await new Promise(function (r) { setTimeout(r, 500); });

  var renderedPath = path.join(config.output, config.prefix + 'rendered.png');
  await page.screenshot({ path: renderedPath, fullPage: false });
  console.log('Screenshot saved: ' + renderedPath);

  await browser.close();

  /* --- Step 2: Pixel diff with pixelmatch --- */
  console.log('Running pixel comparison...');
  var PNG;
  var pixelmatch;
  try {
    PNG = require(path.join(skillsNodeModules, 'pngjs')).PNG;
    var _pm = require(path.join(skillsNodeModules, 'pixelmatch'));
    pixelmatch = _pm.default || _pm;
  } catch (e) {
    try {
      PNG = require('pngjs').PNG;
      var _pm2 = require('pixelmatch');
      pixelmatch = _pm2.default || _pm2;
    } catch (e2) {
      var execSync2 = require('child_process').execSync;
      console.log('Installing dependencies...');
      execSync2('npm install puppeteer pngjs pixelmatch --no-save', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
        shell: true,
      });
      PNG = require(path.join(skillsNodeModules, 'pngjs')).PNG;
      var _pm3 = require(path.join(skillsNodeModules, 'pixelmatch'));
      pixelmatch = _pm3.default || _pm3;
    }
  }

  /* Read both images */
  var designImg = PNG.sync.read(fs.readFileSync(config.design));
  var renderedImg = PNG.sync.read(fs.readFileSync(renderedPath));

  /* Resize to match: use the smaller dimensions */
  var diffWidth = Math.min(designImg.width, renderedImg.width);
  var diffHeight = Math.min(designImg.height, renderedImg.height);

  /* Crop both images to same size if needed */
  var designData = cropImageData(designImg, diffWidth, diffHeight);
  var renderedData = cropImageData(renderedImg, diffWidth, diffHeight);

  /* Run pixelmatch */
  var diffPng = new PNG({ width: diffWidth, height: diffHeight });
  var mismatchCount = pixelmatch(
    designData, renderedData, diffPng.data,
    diffWidth, diffHeight,
    { threshold: config.threshold, includeAA: false }
  );

  var totalPixels = diffWidth * diffHeight;
  var matchPercent = ((1 - mismatchCount / totalPixels) * 100).toFixed(1);
  var mismatchPercent = ((mismatchCount / totalPixels) * 100).toFixed(1);

  /* Save diff image */
  var diffPath = path.join(config.output, config.prefix + 'diff.png');
  fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

  /* Save report */
  var report = {
    match: matchPercent + '%',
    mismatch: mismatchPercent + '%',
    mismatchPixels: mismatchCount,
    totalPixels: totalPixels,
    diffSize: diffWidth + 'x' + diffHeight,
    designSize: designImg.width + 'x' + designImg.height,
    renderedSize: renderedImg.width + 'x' + renderedImg.height,
    threshold: config.threshold,
    files: {
      rendered: renderedPath,
      diff: diffPath,
      design: config.design
    }
  };

  var reportPath = path.join(config.output, config.prefix + 'diff-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  /* Print results */
  console.log('\n=== Visual Diff Results ===');
  console.log('Match:    ' + matchPercent + '%');
  console.log('Mismatch: ' + mismatchPercent + '% (' + mismatchCount + ' pixels)');
  console.log('Diff:     ' + diffPath);
  console.log('Rendered: ' + renderedPath);
  console.log('Report:   ' + reportPath);

  if (parseFloat(matchPercent) >= 95) {
    console.log('\nPASS — visual match is good');
  } else if (parseFloat(matchPercent) >= 85) {
    console.log('\nWARN — needs CSS tweaks');
  } else {
    console.log('\nFAIL — significant visual differences');
  }
}

/* --- Crop image data to target width/height --- */
function cropImageData(img, targetWidth, targetHeight) {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img.data;
  }

  var cropped = Buffer.alloc(targetWidth * targetHeight * 4);
  for (var y = 0; y < targetHeight; y++) {
    var srcOffset = y * img.width * 4;
    var dstOffset = y * targetWidth * 4;
    img.data.copy(cropped, dstOffset, srcOffset, srcOffset + targetWidth * 4);
  }
  return cropped;
}

main().catch(function (err) {
  console.error('Fatal: ' + err.message);
  process.exit(1);
});
