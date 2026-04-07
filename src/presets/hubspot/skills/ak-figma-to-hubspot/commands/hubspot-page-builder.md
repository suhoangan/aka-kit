---
description: "Step 4: Combine modules into HubSpot page template"
argument-hint: <module-names...>
---

## Step 4 — HubSpot Page Builder

Combine multiple HubSpot modules into a full page template using DND (drag-and-drop) syntax.

<task>
$ARGUMENTS
</task>

## Instructions

1. **Read** module directories from `src/undivided-theme/modules/components/`
2. **Read an existing template** from `src/undivided-theme/templates/` (e.g. `homepage.html`) to match style
3. **Generate** page template at `src/undivided-theme/templates/{page-name}.html`

## Template Structure (DND Syntax)

Uses HubSpot drag-and-drop area system, NOT simple `{% module %}` tags.

```html
<!--
  templateType: page
  isAvailableForNewContent: true
  label: Page Name
  screenshotPath: ../images/template-previews/{page-name}.jpg
-->

{% extends "./animation-empty.html" %}

{% block body %}
  {% dnd_area "dnd_area" label="Main section" %}
    {% dnd_section %}
      {% dnd_column %}
        {% dnd_row %}
          {% dnd_module "module_hero"
            path="../modules/components/{name}.module"
            label="Hero"
          %}
          {% end_dnd_module %}
        {% end_dnd_row %}
      {% end_dnd_column %}
    {% end_dnd_section %}
  {% end_dnd_area %}
{% endblock body %}
```

## Rules

- Each module wrapped in `dnd_section > dnd_column > dnd_row > dnd_module`
- Order modules logically (hero → content sections → CTA → footer)
- Module `path` must point to `.module` directory relative to templates folder
- Module variable name uses `module_` prefix with snake_case (e.g. `"module_featured_properties"`)
- Extends `./animation-empty.html` (or `./layouts/base.html` if no animations needed)
- Template comment block at top with `templateType`, `label`, `isAvailableForNewContent`

## Output

Page template at `src/undivided-theme/templates/{page-name}.html`.
