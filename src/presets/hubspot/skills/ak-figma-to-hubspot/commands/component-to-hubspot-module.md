---
description: "Step 3: Convert HTML component into HubSpot CMS module"
argument-hint: <module-name>
---

## Step 3 — Component to HubSpot Module

Convert the standalone HTML component into a HubSpot CMS module matching existing Undivided Theme patterns.

<task>
$ARGUMENTS
</task>

## Instructions

1. **Read** component files from `output/{module-name}/component/`
2. **Read 1-2 existing modules** from `src/undivided-theme/modules/components/` to match code style
3. **Read shared fields** from `src/shared/` (spacing-fields.js, cta-fields.js, title-fields.js)
4. **Read patterns** from `.claude/skills/figma-asset-exporter/figma-asset-exporter/references/hubspot-module-patterns.md`
5. **Generate 5 files** directly in `src/undivided-theme/modules/components/{module-name}.module/`:

| File | Purpose |
|---|---|
| `module.html` | HubL template using `{{ module.field }}`, includes partials |
| `module.scss` | Styles from component.css, converted to SCSS with BEM |
| `module.js` | JS from component.js (if needed) |
| `fields.js` | Field definitions using `@resultify/hubspot-fields-js` |
| `meta.json` | Module metadata (label, icon, template types) |

## Key Rules

- **fields.js NOT fields.json** — uses `@resultify/hubspot-fields-js` library
- **Use shared fields** — import from `src/shared/`, never recreate spacing/CTA/title fields
- **Every module.html** must include spacing partial at top
- **Use partials** for links (`link-renderer.html`) and images (`image-renderer.html`)
- **Group with occurrence** for repeated items (cards, FAQ, carousel slides)
- **styleGroup always last** in `init()` — includes spacing fields

## Image Asset Deployment

After generating module files, **move assets to theme folder**:

1. Copy images from `output/{module-name}/assets/` → `src/undivided-theme/images/modules/{module-name}/`
2. Copy module icon → `src/undivided-theme/images/module-icons/{module-name}.svg`
3. Update `fields.js` image default `src` paths to `../../../images/modules/{module-name}/`
4. Update `meta.json` icon path
5. Update `get_asset_url()` references in `module.html`

## Relative Paths (from `components/{name}.module/`)

| Target | Path |
|---|---|
| Partials | `../../../partials/` |
| SCSS breakpoints | `../../../scss/breakpoints` |
| Shared fields | `../../../../shared/` |
| Images | `../../../images/modules/{module-name}/` |
| Module icons | `../../../images/module-icons/` |

If nested in subfolder, add one more `../` to each path.

## Output

Module files created directly in `src/undivided-theme/modules/components/{module-name}.module/`.
Assets copied to `src/undivided-theme/images/modules/{module-name}/`.

**IMPORTANT:** Write module files directly to `src/undivided-theme/`, NOT to `output/`.
