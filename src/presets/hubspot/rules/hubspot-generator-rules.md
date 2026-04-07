# HubSpot Generator Rules

These rules apply to all Figma-to-HubSpot generation work (`/figma-to-hubspot` command, `figma-to-hubspot` agent).

## Core Rules

1. **Clean, modular code** — Each module self-contained, single responsibility, no spaghetti.
2. **Never mix frameworks** — Vanilla HTML/CSS/JS only. No React, jQuery, Bootstrap, Tailwind, etc.
3. **BEM naming convention** — All CSS classes use Block__Element--Modifier pattern.
4. **Respect HubSpot CMS architecture** — HubL syntax, `fields.js` for editable content, proper `meta.json`, module/template separation.
5. **All assets must be external files** — No base64, no inline SVG (unless explicitly requested). Formats: SVG (vector), PNG (transparency), JPG (photos/backgrounds), WEBP (optimized raster). Reference via `../../../images/modules/{name}/` paths.
6. **HTML, CSS, and JS must be separated** — No inline styles, no inline scripts. Separate `.html`, `.scss`, `.js` files.
7. **Prioritize responsive layout** — Mobile-first. Breakpoints: 375px mobile, 768px small tablet, 1024px tablet, 1440px desktop.

## Page Discovery (Step 0)

When a Figma URL is provided **without** a `node-id` parameter, run the page module lister first:

```bash
node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/list-figma-modules.cjs \
  --file-key {fileKey} --output ./output/{project-name}
```

This outputs `page-module-map.json` + `page-module-map.md` listing all modules with:
- Desktop/mobile frame identification and module listing
- Desktop ↔ Mobile node ID mapping (auto-matched by name)
- Use the mapping to pass `--mobile-node-id` when downloading individual modules

When a Figma URL **has** a `node-id` parameter, skip this step and proceed directly to asset download.

## Project-Specific Patterns

### Field Definitions — `fields.js` (NOT `fields.json`)
- Use `@resultify/hubspot-fields-js` library with `init()`, `fi.*`, `group()`, `styleGroup()`
- Import shared fields from `src/shared/`: `spacing-fields.js`, `cta-fields.js`, `title-fields.js`
- Always include `spacingFields()` in `styleGroup()` for consistent spacing controls
- Use `group()` with `occurrence` for repeated items (cards, FAQ items, carousel slides)

### Partials — Reuse existing renderers
- **Every module** must include `spacing.html` partial at top for spacing CSS vars
- Use `link-renderer.html` for all links/buttons — set `linkRenderer` variable before include
- Use `image-renderer.html` for all images — provides lazy loading and responsive sizing

### Module HTML Pattern
```html
{% set spacing = { spacing: module.style.spacing, enable_spacing_on_mobile: module.style.enable_spacing_on_mobile, spacing_mobile: module.style.spacing_mobile } %}
{% include "../../../partials/spacing.html" %}

<div class="module-{name} {{ spacingClasses }}" style="{{ spacingStyles }}">
  <!-- content -->
</div>
```

### Template Pattern — DND Syntax
Templates use `dnd_area > dnd_section > dnd_column > dnd_row > dnd_module` nesting. NOT simple `{% module %}` tags.

### meta.json Pattern
```json
{
  "label": "Module Name",
  "global": false,
  "host_template_types": ["PAGE", "BLOG_LISTING", "BLOG_POST"],
  "is_available_for_new_content": true,
  "icon": "../../../images/module-icons/{name}.svg"
}
```

### Image Assets — Theme `images/modules/` Folder
Assets live in `src/undivided-theme/images/modules/{module-name}/`, NOT inside `.module/` dirs.
- Referenced in `fields.js`: `src: '../../../images/modules/{module-name}/image.png'`
- Referenced in `module.html`: `{{get_asset_url("../../../images/modules/{module-name}/image.png")}}`
- After generating, move assets from `output/` to theme images folder and update paths

### Utility CSS Classes
The theme uses utility classes for typography: `font-medium`, `display-xl`, `lg-display-sm`, `text-lg`, `lg-text-sm`, etc. Reference `src/undivided-theme/scss/` for available utilities.

## Progress Tracker

Every `/figma-to-hubspot` run MUST maintain `./output/{project-name}/progress-tracker.md`.

### Created in Step 0 (Page Module Map)
- Lists ALL modules discovered in the Figma file
- Table columns: #, Module Name, Desktop Node, Mobile Node, Status, Desktop %, Mobile %, Notes
- Status values: ⬜ todo, 🔄 in-progress, ✅ done, ⚠️ partial, ❌ blocked

### Updated in Step 5 (after each module completes)
- Update the module's row with final status and match percentages
- Add detailed entry under "Completed Modules" section
- Update "Missing Assets" if any
- Update "Last updated" timestamp

### Progress Tracker Location
- Per-project: `./output/{project-name}/progress-tracker.md`
- If no project name, derive from Figma file name (kebab-case)
