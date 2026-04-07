---
description: "Step 2: Visual comparison and auto-fix CSS against cached design screenshots"
argument-hint: <module-name>
---

## Step 2 — Visual Design Test

Render the generated component in a headless browser, pixel-diff against the Figma design screenshot, and fix CSS until match >= 95%.

<task>
$ARGUMENTS
</task>

## Instructions

### 1. Run visual diff script

```bash
node .claude/skills/visual-diff-tester/visual-diff-tester/scripts/visual-diff.cjs \
  --component ./output/{module-name}/component/component.html \
  --design ./output/{module-name}/design/desktop.png \
  --output ./output/{module-name}/design \
  --fonts ./output/{module-name}/design-tokens.json \
  --width 1440
```

This produces:
- `rendered.png` — screenshot of component with correct fonts loaded
- `diff.png` — red overlay showing mismatched pixels
- `diff-report.json` — match percentage and stats

The `--fonts` flag loads font families from `design-tokens.json` via Google Fonts for accurate text rendering.

### 2. Analyze results

- Read `diff-report.json` for match percentage
- Read `diff.png` to see where mismatches are
- Read `rendered.png` to see what the component actually looks like
- Compare with `desktop.png` (Figma design)

### 3. Fix CSS (iterative loop)

If match < 95%, fix issues in this priority order:

1. **Layout** — spacing, padding, margin, gap, alignment
2. **Typography** — font-size, font-weight, line-height, font-family
3. **Colors** — text, background, border, shadow
4. **Sizing** — width, height, max-width, border-radius
5. **Responsive** — breakpoint behavior

Fix rules:
- Only modify `component.css` unless HTML structure is wrong
- Fix one category at a time
- Re-run the visual diff script after each round of fixes
- Repeat until match >= 95%

### 4. Mobile test (if mobile.png exists)

```bash
node .claude/skills/visual-diff-tester/visual-diff-tester/scripts/visual-diff.cjs \
  --component ./output/{module-name}/component/component.html \
  --design ./output/{module-name}/design/mobile.png \
  --output ./output/{module-name}/design \
  --fonts ./output/{module-name}/design-tokens.json \
  --width 375 \
  --prefix mobile-
```

Uses `--prefix mobile-` to output `mobile-rendered.png`, `mobile-diff.png`, `mobile-diff-report.json` without overwriting desktop files.

## Rules

- **No Figma MCP calls** — use only local screenshots from `output/{module-name}/design/`
- Target >= 95% match for PASS
- Document what was changed and why after each fix round
- Max 5 fix iterations — if still < 85% after 5 rounds, report remaining issues

## Output

Updated `output/{module-name}/component/component.css` (and `.html` only if structural fix needed).

Final diff report in `output/{module-name}/design/diff-report.json`.
