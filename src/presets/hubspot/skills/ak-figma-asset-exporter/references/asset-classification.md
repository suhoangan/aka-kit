# Asset Classification Rules

## Format Decision

| Asset Type | Format | Reason |
|---|---|---|
| Icons | SVG | Scalable, small file size |
| Logos | SVG | Scalable, crisp at any size |
| Illustrations (vector) | SVG | Preserves vector quality |
| Photos | WEBP | Modern compression, smaller than JPEG |
| Avatars | WEBP | Photo content, needs compression |
| Background images | WEBP | Raster content, needs compression |
| Screenshots | WEBP | Raster content |

## Naming Convention

- Use kebab-case: `logo-company-name.svg`, `avatar-person-name.webp`
- Be descriptive: `hero-background.webp` not `bg1.webp`
- Include context: `icon-arrow-right.svg` not `arrow.svg`

## Figma REST API Asset Export

Assets are exported via `GET /v1/images/:fileKey?ids=:nodeIds&format=svg|png`.
The download script auto-classifies nodes by name and exports with the correct format.
File names are derived from Figma node names, converted to kebab-case.

## Detection Heuristics

To classify assets from Figma context:
1. Check Figma node name (e.g. "Img" = likely photo, "image 2688" = logo)
2. Check dimensions: small + square = icon, large + rectangular = photo
3. Check parent context: inside "Avatar" = photo, inside "Logo" = SVG
4. Check if the image has transparency = likely icon/logo (SVG)
