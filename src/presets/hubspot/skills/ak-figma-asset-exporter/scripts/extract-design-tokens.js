#!/usr/bin/env node

/**
 * Extract design tokens (typography, colors, spacing, layout) from cached Figma node tree.
 *
 * Reads node-tree.json (saved by download-figma-assets.js) and outputs design-tokens.json
 * with all CSS-relevant properties for accurate component generation.
 *
 * Usage:
 *   node extract-design-tokens.js --input ./output/hero-banner/node-tree.json
 *
 * Output: design-tokens.json in same directory as input
 */

var fs = require('fs');
var path = require('path');

/* --- Parse CLI arguments --- */
function parseArgs() {
  var args = process.argv.slice(2);
  var parsed = { input: '' };
  for (var i = 0; i < args.length; i++) {
    if (args[i] === '--input' && args[i + 1]) parsed.input = args[++i];
  }
  return parsed;
}

/* --- Convert Figma RGBA (0-1) to CSS hex/rgba --- */
function figmaColorToCss(color) {
  if (!color) return null;
  var r = Math.round((color.r || 0) * 255);
  var g = Math.round((color.g || 0) * 255);
  var b = Math.round((color.b || 0) * 255);
  var a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a.toFixed(2) + ')';
  }
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* --- Extract typography tokens from a TEXT node --- */
function extractTypography(node) {
  var style = node.style || {};
  var token = {
    fontFamily: style.fontFamily || null,
    fontSize: style.fontSize || null,
    fontWeight: style.fontWeight || null,
    lineHeight: null,
    letterSpacing: null,
    textAlign: (style.textAlignHorizontal || 'LEFT').toLowerCase(),
    textTransform: style.textCase === 'UPPER' ? 'uppercase' :
                   style.textCase === 'LOWER' ? 'lowercase' :
                   style.textCase === 'TITLE' ? 'capitalize' : 'none',
    textDecoration: style.textDecoration === 'UNDERLINE' ? 'underline' :
                    style.textDecoration === 'STRIKETHROUGH' ? 'line-through' : 'none'
  };

  /* Line height */
  if (style.lineHeightPx) {
    token.lineHeight = Math.round(style.lineHeightPx) + 'px';
    if (style.fontSize) {
      token.lineHeightRatio = +(style.lineHeightPx / style.fontSize).toFixed(3);
    }
  } else if (style.lineHeightPercentFontSize) {
    token.lineHeight = style.lineHeightPercentFontSize + '%';
  }

  /* Letter spacing */
  if (style.letterSpacing) {
    token.letterSpacing = style.letterSpacing + 'px';
  }

  return token;
}

/* --- Extract fill colors from node --- */
function extractFills(fills) {
  if (!fills || !Array.isArray(fills)) return [];
  return fills
    .filter(function (f) { return f.visible !== false && f.type === 'SOLID' && f.color; })
    .map(function (f) {
      return {
        color: figmaColorToCss(f.color),
        opacity: f.opacity !== undefined ? f.opacity : 1
      };
    });
}

/* --- Extract stroke from node --- */
function extractStrokes(node) {
  var strokes = node.strokes || [];
  if (strokes.length === 0) return null;

  var visible = strokes.filter(function (s) { return s.visible !== false && s.type === 'SOLID'; });
  if (visible.length === 0) return null;

  return {
    color: figmaColorToCss(visible[0].color),
    weight: node.strokeWeight || 1,
    align: (node.strokeAlign || 'INSIDE').toLowerCase()
  };
}

/* --- Extract layout/spacing from auto-layout node --- */
function extractLayout(node) {
  var layout = {};

  /* Auto-layout = flex */
  if (node.layoutMode) {
    layout.display = 'flex';
    layout.flexDirection = node.layoutMode === 'VERTICAL' ? 'column' : 'row';
    layout.gap = node.itemSpacing || 0;

    /* Alignment mapping */
    var primary = node.primaryAxisAlignItems || 'MIN';
    var counter = node.counterAxisAlignItems || 'MIN';

    var justifyMap = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' };
    var alignMap = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' };

    layout.justifyContent = justifyMap[primary] || 'flex-start';
    layout.alignItems = alignMap[counter] || 'flex-start';

    /* Wrap */
    if (node.layoutWrap === 'WRAP') layout.flexWrap = 'wrap';
  }

  /* Padding */
  if (node.paddingTop || node.paddingRight || node.paddingBottom || node.paddingLeft) {
    layout.padding = {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0
    };
  }

  /* Border radius */
  if (node.cornerRadius) {
    layout.borderRadius = node.cornerRadius;
  } else if (node.rectangleCornerRadii) {
    var r = node.rectangleCornerRadii;
    layout.borderRadius = r[0] + 'px ' + r[1] + 'px ' + r[2] + 'px ' + r[3] + 'px';
  }

  return Object.keys(layout).length > 0 ? layout : null;
}

/* --- Extract size/constraints from node --- */
function extractSize(node) {
  var box = node.absoluteBoundingBox;
  if (!box) return null;
  return {
    width: Math.round(box.width),
    height: Math.round(box.height)
  };
}

/* --- Walk tree and extract all tokens --- */
function extractTokens(node, tokens, parentPath) {
  tokens = tokens || { typography: [], colors: [], layout: [], elements: [] };
  parentPath = parentPath || '';

  var nodePath = parentPath ? parentPath + ' > ' + node.name : node.name;
  var element = {
    name: node.name,
    path: nodePath,
    type: node.type
  };

  /* Typography (TEXT nodes) */
  if (node.type === 'TEXT') {
    var typo = extractTypography(node);
    typo.nodeName = node.name;
    typo.text = (node.characters || '').substring(0, 100);
    tokens.typography.push(typo);
    element.typography = typo;
  }

  /* Colors from fills */
  var fills = extractFills(node.fills);
  if (fills.length > 0) {
    fills.forEach(function (f) {
      f.nodeName = node.name;
      f.nodeType = node.type;
    });
    tokens.colors.push.apply(tokens.colors, fills);
    element.fills = fills;
  }

  /* Background color shorthand */
  var bgFills = extractFills(node.background || node.fills);
  if (bgFills.length > 0 && node.type === 'FRAME') {
    element.backgroundColor = bgFills[0].color;
  }

  /* Stroke/border */
  var stroke = extractStrokes(node);
  if (stroke) element.border = stroke;

  /* Layout (auto-layout frames) */
  var layout = extractLayout(node);
  if (layout) {
    layout.nodeName = node.name;
    tokens.layout.push(layout);
    element.layout = layout;
  }

  /* Size */
  var size = extractSize(node);
  if (size) element.size = size;

  /* Effects (shadows, blurs) */
  if (node.effects && node.effects.length > 0) {
    element.effects = node.effects
      .filter(function (e) { return e.visible !== false; })
      .map(function (e) {
        var result = { type: e.type.toLowerCase() };
        if (e.color) result.color = figmaColorToCss(e.color);
        if (e.offset) result.offset = { x: e.offset.x, y: e.offset.y };
        if (e.radius !== undefined) result.radius = e.radius;
        if (e.spread !== undefined) result.spread = e.spread;
        return result;
      });
  }

  /* Only add elements with meaningful data */
  var hasData = element.typography || element.fills || element.layout ||
                element.border || element.effects || element.backgroundColor;
  if (hasData) {
    tokens.elements.push(element);
  }

  /* Recurse children */
  var children = node.children || [];
  for (var i = 0; i < children.length; i++) {
    extractTokens(children[i], tokens, nodePath);
  }

  return tokens;
}

/* --- Deduplicate colors --- */
function deduplicateColors(colors) {
  var seen = {};
  return colors.filter(function (c) {
    var key = c.color + '_' + c.opacity;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

/* --- Deduplicate typography by unique combo --- */
function deduplicateTypography(typos) {
  var seen = {};
  return typos.filter(function (t) {
    var key = [t.fontFamily, t.fontSize, t.fontWeight, t.lineHeight].join('|');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

/* --- Extract unique font families --- */
function extractFontFamilies(typos) {
  var families = {};
  typos.forEach(function (t) {
    if (t.fontFamily) {
      if (!families[t.fontFamily]) families[t.fontFamily] = new Set();
      if (t.fontWeight) families[t.fontFamily].add(t.fontWeight);
    }
  });
  return Object.keys(families).map(function (name) {
    return { family: name, weights: Array.from(families[name]).sort() };
  });
}

/* --- Main --- */
function main() {
  var config = parseArgs();

  if (!config.input) {
    console.error('Error: --input is required (path to node-tree.json)');
    process.exit(1);
  }

  config.input = path.resolve(config.input);
  if (!fs.existsSync(config.input)) {
    console.error('Error: File not found: ' + config.input);
    process.exit(1);
  }

  console.log('Reading node tree: ' + config.input);
  var nodeTree = JSON.parse(fs.readFileSync(config.input, 'utf-8'));

  /* Extract tokens */
  var tokens = extractTokens(nodeTree);

  /* Deduplicate and summarize */
  tokens.colors = deduplicateColors(tokens.colors);
  var uniqueTypo = deduplicateTypography(tokens.typography);
  tokens.fonts = extractFontFamilies(tokens.typography);
  tokens.typographyUnique = uniqueTypo;

  /* Root element size */
  var rootSize = extractSize(nodeTree);
  if (rootSize) tokens.rootSize = rootSize;

  /* Root layout */
  var rootLayout = extractLayout(nodeTree);
  if (rootLayout) tokens.rootLayout = rootLayout;

  /* Summary */
  console.log('\n=== Design Tokens Summary ===');
  console.log('Fonts:      ' + tokens.fonts.map(function (f) { return f.family + ' (' + f.weights.join(',') + ')'; }).join(', '));
  console.log('Colors:     ' + tokens.colors.length + ' unique');
  console.log('Typography: ' + tokens.typographyUnique.length + ' unique styles');
  console.log('Layout:     ' + tokens.layout.length + ' auto-layout nodes');
  console.log('Elements:   ' + tokens.elements.length + ' with design data');
  if (rootSize) console.log('Root size:  ' + rootSize.width + 'x' + rootSize.height);

  /* Save */
  var outputPath = path.join(path.dirname(config.input), 'design-tokens.json');
  fs.writeFileSync(outputPath, JSON.stringify(tokens, null, 2));
  console.log('\nSaved: ' + outputPath);
}

main();
