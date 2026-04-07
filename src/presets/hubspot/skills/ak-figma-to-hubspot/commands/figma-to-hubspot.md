---
description: Convert Figma design to HubSpot CMS module/page (runs all steps sequentially)
argument-hint: <figma-url-with-node-id> [--page]
---

## Your mission

Convert the Figma design into a production-ready HubSpot CMS module (or full page if `--page` flag).

<task>
$ARGUMENTS
</task>

## Prerequisites

- `FIGMA_ACCESS_TOKEN` in project `.env` file (auto-loaded by scripts)
- No Figma MCP needed — uses Figma REST API directly

## Pipeline — Execute ALL Steps Sequentially (DO NOT delegate to sub-commands)

**CRITICAL:** Execute each step inline within this command. Do NOT invoke `/generate:figma-to-component`, `/generate:visual-design-test`, etc. as separate skills. Run all steps yourself, one by one, in order.

---

### Step 0 — Page Module Map (first run or when URL has no node-id)

**When to run:** ALWAYS on first run for a Figma file, OR when the URL has no `node-id` parameter.

1. **Parse Figma URL** → extract `fileKey`
2. **Run page module lister**:
   ```bash
   node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/list-figma-modules.cjs \
     --file-key {fileKey} --output ./output/{project-name}
   ```
3. **Read output** `page-module-map.json` + `page-module-map.md`
4. **Create/Update progress tracker** at `./output/{project-name}/progress-tracker.md` using the module map:

   ```markdown
   # Figma → HubSpot Progress Tracker

   **Figma file:** [file URL]
   **Project:** {project-name}
   **Last updated:** {date}

   ## Page Overview

   | # | Module Name | Desktop Node | Mobile Node | Status | Desktop % | Mobile % | Notes |
   |---|-------------|-------------|-------------|--------|-----------|----------|-------|
   | 1 | banner      | 0:7024      | 0:6733      | ⬜ todo | —         | —        |       |
   | 2 | hero        | 0:1234      | 0:5678      | ⬜ todo | —         | —        |       |
   | ... | ...       | ...         | ...         | ...    | ...       | ...      |       |

   ## Status Legend
   - ⬜ todo — Not started
   - 🔄 in-progress — Currently being built
   - ✅ done — Module complete, build passes
   - ⚠️ partial — Done but below 95% match
   - ❌ blocked — Cannot proceed (missing assets, etc.)

   ## Completed Modules

   (filled after each module run)

   ## Missing Assets

   (filled after each module run)
   ```

5. **If URL has a `node-id`**, skip the lister but still check if `progress-tracker.md` exists. If it exists, read it to understand context. If not, create a minimal one.

**After Step 0, proceed to Step 1 for the target module.**

---

### Step 1 — Figma to Component

1. **Parse Figma URL** → extract `fileKey` + `nodeId` (convert `-` to `:` in nodeId)
   - Branch URLs: `figma.com/design/:fileKey/branch/:branchKey/:fileName` → use branchKey as fileKey
2. **Download assets** via Figma REST API (use `.cjs` version if project has `"type": "module"`):
   ```bash
   node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/download-figma-assets.cjs \
     --file-key {fileKey} --node-id "{nodeId}" \
     --mobile-node-id "{mobileNodeId}" \
     --output ./output/{module-name}/assets
   ```
   - Outputs: `node-tree.json`, `design/desktop.png`, `assets/assets-manifest.json`
   - `--mobile-node-id` optional — omit if no mobile frame
3. **Extract design tokens**:
   ```bash
   node .claude/skills/figma-asset-exporter/figma-asset-exporter/scripts/extract-design-tokens.cjs \
     --input ./output/{module-name}/node-tree.json
   ```
   - Outputs: `design-tokens.json` (typography, colors, layout, fonts)
4. **Derive module name** from Figma frame name (kebab-case)
5. **Read theme context**: `_variables.scss` breakpoints, 1-2 existing modules for patterns
6. **Read design tokens** + **desktop screenshot** to understand the design
7. **Generate 3 files** in `output/{module-name}/component/`:
   - `component.html` — semantic HTML, BEM classes, accessible markup
   - `component.css` — BEM, mobile-first responsive, exact Figma token values
   - `component.js` — vanilla JS (empty if no interactivity)

**After Step 1 completes, immediately proceed to Step 2.**

---

### Step 2 — Visual Design Test

1. **Run visual diff** (use `.cjs` version):
   ```bash
   node .claude/skills/visual-diff-tester/visual-diff-tester/scripts/visual-diff.cjs \
     --component ./output/{module-name}/component/component.html \
     --design ./output/{module-name}/design/desktop.png \
     --output ./output/{module-name}/design \
     --fonts ./output/{module-name}/design-tokens.json \
     --width 1440
   ```
2. **Analyze**: Read `diff-report.json`, `diff.png`, `rendered.png`
3. **Fix CSS** if match < 95% (priority: layout → typography → colors → sizing)
   - Only modify `component.css` unless HTML structure is wrong
   - Re-run visual diff after each fix round
   - Max 5 iterations
4. **Mobile test** (if `mobile.png` exists):
   ```bash
   node .claude/skills/visual-diff-tester/visual-diff-tester/scripts/visual-diff.cjs \
     --component ./output/{module-name}/component/component.html \
     --design ./output/{module-name}/design/mobile.png \
     --output ./output/{module-name}/design \
     --fonts ./output/{module-name}/design-tokens.json \
     --width 375 --prefix mobile-
   ```

**After Step 2 passes (>= 95%), immediately proceed to Step 3.**

---

### Step 3 — Component to HubSpot Module

1. **Read** component files from `output/{module-name}/component/`
2. **Read 1-2 existing modules** from `src/undivided-theme/modules/components/` to match style
3. **Read shared fields** from `src/shared/` (spacing-fields.js, cta-fields.js, title-fields.js)
4. **Read patterns** from `.claude/skills/figma-asset-exporter/figma-asset-exporter/references/hubspot-module-patterns.md`
5. **Generate 5 files** directly in `src/undivided-theme/modules/components/{module-name}.module/`:

| File | Purpose |
|---|---|
| `module.html` | HubL template, includes spacing partial, Schema.org if applicable |
| `module.scss` | SCSS with BEM, `@use '../../../scss/breakpoints' as *;` |
| `module.js` | Vanilla JS (if interactivity needed) |
| `fields.js` | `@resultify/hubspot-fields-js` with shared fields |
| `meta.json` | Module metadata |

Key rules:
- **fields.js NOT fields.json** — uses `@resultify/hubspot-fields-js`
- **Use shared fields** — import from `src/shared/`
- **Every module.html** starts with spacing partial
- **Use partials** for links and images
- **Group with occurrence** for repeated items
- **styleGroup always last** in `init()`
- **SCSS uses `@use` not `@import`** for breakpoints

6. **Copy assets** to theme:
   - Images → `src/undivided-theme/images/modules/{module-name}/`
   - Module icon → `src/undivided-theme/images/module-icons/{module-name}.svg`
7. **Run build** to verify compilation: `yarn build`

**After Step 3 completes, proceed to Step 5 (Progress Update). Then Step 4 ONLY if `--page` flag.**

---

### Step 4 — HubSpot Page Builder (only if --page or multiple frames)

1. Read existing template from `src/undivided-theme/templates/` to match style
2. Generate page template using DND syntax at `src/undivided-theme/templates/{page-name}.html`
3. Each module wrapped in `dnd_section > dnd_column > dnd_row > dnd_module`

---

### Step 5 — Update Progress Tracker & Generate Report (ALWAYS run after Step 3)

After completing a module, **ALWAYS** do both:

#### 5a. Update progress tracker

Update `./output/{project-name}/progress-tracker.md`:

1. **Read** the existing progress tracker
2. **Update the module row** in the Page Overview table:
   - Status: `✅ done` or `⚠️ partial`
   - Desktop %: final visual match percentage
   - Mobile %: final mobile match percentage (or `—` if no mobile frame)
   - Notes: any issues, missing assets, or important details
3. **Add entry to Completed Modules section**:
   ```markdown
   ### {module-name} — {date}
   - Figma: {desktop-node-id} / {mobile-node-id}
   - Desktop match: {X}%
   - Mobile match: {X}%
   - Files: module.html, module.scss, fields.js, meta.json, module.js
   - Assets: {list of copied SVG/PNG files}
   - Issues: {any unresolved issues or "none"}
   ```
4. **Update Missing Assets section** if any assets could not be exported
5. **Update "Last updated" date** at the top

#### 5b. Generate report (MANDATORY)

**ALWAYS** save a report to `plans/reports/` after completing each module. Use the naming pattern from `## Naming` in hook injection, or fallback to: `plans/reports/figma-to-hubspot-{date}-{module-name}.md`

Report template:

```markdown
# Figma → HubSpot: {Module Name}

**Date:** {YYYY-MM-DD}
**Figma:** {figma-url}
**Desktop node:** {node-id} | **Mobile node:** {node-id}

## Module Overview

**Name:** `{module-name}`
**Path:** `src/undivided-theme/modules/components/{module-name}.module/`
**Purpose:** {brief description}

## Design Analysis

{Key design details: typography, colors, layout, spacing, interactions}

## Pipeline Status

| Step | Status | Notes |
|---|---|---|
| 0 — Page Module Map | {done/skipped} | {notes} |
| 1 — Figma to Component | {done} | {notes} |
| 2 — Visual Design Test | {done} | Desktop: {X}%, Mobile: {X}% |
| 3 — Component to HubSpot | {done} | {notes} |
| 4 — Page Builder | {done/skipped} | {notes} |
| 5 — Progress Update | {done} | {notes} |

## Files Created

| File | Lines | Purpose |
|---|---|---|
| `fields.js` | {n} | {description} |
| `module.html` | {n} | {description} |
| `module.scss` | {n} | {description} |
| `module.js` | {n} | {description} |
| `meta.json` | {n} | {description} |

## Assets

{List of images and icons copied to theme}

## CMS Fields

{List of all editable fields with types and defaults}

## Visual Diff Results

| Viewport | Match | Notes |
|---|---|---|
| Desktop {width}px | {X}% | {notes} |
| Mobile {width}px | {X}% | {notes} |

## Build Status

`yarn build` — {PASS/FAIL}

## Unresolved Questions

{List any open issues, or "None"}
```

**Both 5a and 5b are MANDATORY — never skip them.**

---

## Rules

- **Sequential execution** — never skip or reorder steps
- **Follow** `.claude/rules/hubspot-generator-rules.md`
- **No Figma MCP** — uses `FIGMA_ACCESS_TOKEN` + REST API only
- **Skip existing** — all scripts skip already-downloaded non-empty files
- **No frameworks** — vanilla HTML/CSS/JS only
- **BEM naming** — all CSS classes
- **Assets** — external files only, no base64
- **List missing assets** at the end
- **Always update progress tracker** after each module

## Security

- Never expose `FIGMA_ACCESS_TOKEN` in output files or logs
- Never commit API tokens to git
- Scope: Figma-to-HubSpot conversion only. Does NOT handle deployment, DNS, or server config.
