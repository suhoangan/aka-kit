---
description: "Step 1: Cache Figma design, export assets, generate standalone HTML component"
argument-hint: <figma-url-with-node-id> [desktop|mobile]
---

## Step 1 — Figma to Component

Cache the Figma file, extract design tokens, export assets, and generate a standalone HTML component.

<task>
$ARGUMENTS
</task>

## Instructions

### 0. FIGMA_ACCESS_TOKEN

The script auto-loads `FIGMA_ACCESS_TOKEN` from the project `.env` file. No manual setup needed.

### 1. Parse Figma URL

Extract from URL: `figma.com/design/:fileKey/:fileName?node-id=:nodeId`
- Convert `-` to `:` in nodeId (e.g. `0-7050` → `0:7050`)
- For branch URLs: `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use branchKey as fileKey

### 2. Derive module name
- From the Figma frame name or URL filename
- Use kebab-case (e.g. `hero-banner`, `testimonials-carousel`)

### 3. Download assets via Figma REST API

Run the download script — it handles fetching the node tree, identifying image children, exporting, and downloading:

```bash
node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/download-figma-assets.cjs \
  --file-key {fileKey} \
  --node-id "{nodeId}" \
  --mobile-node-id "{mobileNodeId}" \
  --output ./output/{module-name}/assets
```

This will:
- Fetch node tree from Figma API and cache to `node-tree.json`
- Identify image nodes (icons → SVG, photos → PNG)
- Download original images via `/v1/files/:key/images` (no re-rendering)
- Fallback to render export for missing originals
- Take desktop screenshot → `design/desktop.png`
- Take mobile screenshot → `design/mobile.png` (if `--mobile-node-id` provided)
- Write `assets-manifest.json` with results
- **Skip files already downloaded** (non-empty)

Note: `--mobile-node-id` is optional. Omit if no mobile frame in Figma.

### 4. Extract design tokens

```bash
node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/extract-design-tokens.cjs \
  --input ./output/{module-name}/node-tree.json
```

This extracts from the cached node tree:
- **Typography**: font-family, size, weight, line-height, letter-spacing, text-align
- **Colors**: all unique fill colors as CSS hex/rgba
- **Layout**: flex direction, gap, justify, align, padding, border-radius
- **Fonts**: unique font families with weights (for Google Fonts loading)
- **Effects**: shadows, blurs

Output: `design-tokens.json` — **read this before generating CSS** to use exact Figma values.

### 5. Read existing theme context
- Check `src/undivided-theme/scss/_variables.scss` for grid breakpoints
- Check `src/undivided-theme/scss/_breakpoints.scss` for responsive mixins
- Scan 1-2 existing modules in `src/undivided-theme/modules/components/` to match code patterns
- Note utility CSS classes: `font-medium`, `display-xl`, `lg-display-sm`, `text-lg`, etc.

### 6. Generate 3 files in `output/{module-name}/component/`:
- `component.html` — semantic HTML, BEM classes, accessible markup
- `component.css` — BEM structure, mobile-first responsive, match theme breakpoints
- `component.js` — vanilla JS, DOMContentLoaded (empty if no interactivity)

Reference assets with relative paths:
```html
<img src="../assets/images/photo-name.png" alt="...">
<img src="../assets/icons/icon-name.svg" alt="...">
```

## Rules

- **No Figma MCP** — uses Figma REST API via `FIGMA_ACCESS_TOKEN` only
- **Skip existing** — script skips already-downloaded non-empty files
- No frameworks (no React, jQuery, Bootstrap, Tailwind)
- No inline styles, no inline scripts
- BEM naming: `.block__element--modifier`
- Responsive breakpoints from theme: xs:0, sm:576px, md:768px, lg:992px, xl:1200px, xxl:1400px
- No base64 images, no embedded SVG unless requested
- List any assets that failed to download at the end

## Output

```
output/{module-name}/
  node-tree.json                      ← cached Figma node tree (for token extraction)
  design-tokens.json                  ← extracted CSS properties (fonts, colors, spacing, layout)
  design/
    desktop.png                       ← screenshot from Figma API
    mobile.png                        ← mobile screenshot (if --mobile-node-id provided)
  assets/
    icons/                            ← SVG files
    images/                           ← PNG files
    assets-manifest.json              ← download results
  component/
    component.html
    component.css
    component.js
```
