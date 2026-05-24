---
name: aka:figma-to-code
model: sonnet
description: Convert Figma designs to code using figma-mcp-go MCP server. Downloads assets, extracts design tokens, maps components to file paths. Use when user shares Figma URL or asks to implement a design.
---

# Figma to Code

Convert Figma designs into production code using the `figma-mcp-go` MCP server.

## Prerequisites

MCP server `figma` must be configured (auto-installed by aka-kit). No API key needed.

## When to Use

- User shares a Figma URL (file, frame, or component)
- User says "implement this design", "build from Figma", "match the design"
- Need to extract colors, typography, spacing from Figma
- Need to download and map assets (images, icons, SVGs)

## Workflow

### Step 1: Fetch Design Data

Use MCP tools to get Figma file/frame data:

```
figma → get_file(fileKey) → full file structure
figma → get_file_nodes(fileKey, nodeIds) → specific frames/components
figma → get_images(fileKey, nodeIds, format, scale) → export assets
```

**Extract from Figma URL:**

- `figma.com/design/{fileKey}/...?node-id={nodeId}` → fileKey + nodeId
- `figma.com/file/{fileKey}/...` → fileKey only

### Step 2: Extract Design Tokens

From Figma data, extract:

**Colors:**

- Background fills → CSS colors / Tailwind classes
- Text fills → text colors
- Border/stroke → border colors

**Typography:**

- Font family, size, weight, line-height, letter-spacing
- Map to project font system (Tailwind, CSS vars, etc.)

**Spacing & Layout:**

- Padding, gap, margins from auto-layout
- Frame dimensions → widths, heights
- Constraints → responsive behavior

**Effects:**

- Shadows → box-shadow / Tailwind shadow
- Blur → backdrop-blur
- Border radius → rounded corners

### Step 2b: Detect Frame Fills (MCP Blindspot)

**CRITICAL:** MCP tools do NOT expose fills on FRAME nodes — solid colors, gradients, and image fills are invisible. Only `cornerRadius`, `padding`, `strokes` are returned.

**Detection via screenshot analysis:**

1. Save screenshot of target frame via MCP `save_screenshots(scale=1)`
2. Read screenshot visually and classify background:
   - **Solid color** → extract hex, use `background-color`
   - **Linear/radial gradient** → identify direction + color stops, use CSS `linear-gradient()`
   - **Image fill** → export frame as background asset, use `background-image`
   - **Image + overlay** → export image + add overlay div with gradient or semi-transparent color
3. Cross-check: white text + no MCP fills → dark background exists; zero shape children + visible background → fills on FRAME itself

### Step 3: Download Assets

Use `get_images` to export:

- **Icons/SVGs:** `format: "svg", scale: 1`
- **Images:** `format: "png", scale: 2` (retina)
- **Logos:** `format: "svg"`

Map assets to project paths:

```
icons/   → public/icons/ or src/assets/icons/
images/  → public/images/ or src/assets/images/
logos/   → public/ or src/assets/
```

### Step 4: Generate Code

Based on project type:

**React/Next.js:**

- Components with Tailwind/CSS modules
- Responsive breakpoints from Figma constraints
- Image imports with next/image

**HubSpot:**

- HubL templates with module fields
- CSS following theme variables
- Assets in theme/images/

**HTML/CSS:**

- Semantic HTML structure
- CSS with custom properties for tokens
- Asset references

## Asset Naming Convention

```
Figma layer name → file name
"Icon/Arrow Right" → arrow-right.svg
"Hero Image" → hero-image.png
"Logo Dark" → logo-dark.svg
```

- kebab-case all names
- Strip special characters
- Preserve format intent (icon→svg, photo→png)

## Design Token Mapping

| Figma Property  | CSS                   | Tailwind      |
| --------------- | --------------------- | ------------- |
| Fill #3B82F6    | color: #3B82F6        | text-blue-500 |
| Font Size 16    | font-size: 1rem       | text-base     |
| Border Radius 8 | border-radius: 0.5rem | rounded-lg    |
| Shadow 0,4,6    | box-shadow: 0 4px 6px | shadow-md     |
| Gap 16          | gap: 1rem             | gap-4         |
| Padding 24      | padding: 1.5rem       | p-6           |

## Constraints

- Always download assets at 2x for retina
- Respect component boundaries (don't flatten nested components)
- Use project's existing design system/tokens when available
- Ask user for target directory before saving assets
