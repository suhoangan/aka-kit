---
name: aka:hubspot-hubl
description: HubSpot HubL syntax, variables, functions, and filters. Use when creating HubSpot modules with *.html or *.hubl.html files.
paths:
  - '**/*.html'
  - '**/*.hubl.html'
---

# HubSpot HubL Skill

HubL (HubSpot Markup Language) is the templating language for HubSpot CMS
themes and modules. This skill provides syntax, patterns, and best practices
for working with HubL templates.

## Core syntax

### Delimiters

- `{% ... %}` - Statements (logic, loops, control flow, tags)
- `{{ ... }}` - Expressions (output values)
- `{# ... #}` - Comments

### Variables

Define variables with `{% set %}` and reference with `{{ }}`:

```hubl
{% set title = module.title %}
{% set spacing = {
  spacing: module.style.spacing,
  enable_spacing_on_mobile: module.style.enable_spacing_on_mobile
} %}
```

### Control structures

**Conditionals:**
```hubl
{% if module.title %}
  <h2>{{ module.title }}</h2>
{% elif module.subtitle %}
  <h3>{{ module.subtitle }}</h3>
{% else %}
  <p>No title</p>
{% endif %}
```

**Loops:**
```hubl
{% for item in module.items %}
  <div>{{ item.name }}</div>
{% endfor %}
```

For complete loop documentation including loop properties, nested loops, and
cycle tags, see [references/loops.md](references/loops.md).

## Module access

Access module fields through the `module` object:

```hubl
{{ module.title }}
{{ module.style.spacing.padding.top.value }}
{{ module.link.url.href }}
```

For nested groups, use dot notation:
```hubl
{{ module.style.alignment.horizontal_align }}
```

## Common filters

Use filters with pipe syntax `{{ value|filter }}`:

- `escape_html` - Escape HTML entities
- `escape_url` - URL encode
- `escape_attr` - Escape for HTML attributes
- `lower` - Convert to lowercase
- `upper` - Convert to uppercase
- `replace` - String replacement
- `default` - Provide default value if empty

Example:
```hubl
{{ module.text|escape_html }}
{{ module.style.alignment.horizontal_align|lower }}
```

For complete filter reference, see [references/filters.md](references/filters.md).

## Template structure

### Template inheritance

Use `extends` and `block` for layout inheritance:

```hubl
{% extends "./layouts/base.html" %}

{% block body %}
  <div>Page content</div>
{% endblock body %}
```

### Includes

Include partials with `{% include %}`:

```hubl
{% include "../../partials/image-renderer.html" %}
{% include "../../partials/spacing.html" %}
```

### DND areas

Drag-and-drop areas for content editors:

```hubl
{% dnd_area "dnd_area" label="Main section" %}
  {% dnd_section %}
    {% dnd_column %}
      {% dnd_row %}
        {% dnd_module "module_id" path="../modules/component.module" label="Component" %}
        {% end_dnd_module %}
      {% end_dnd_row %}
    {% end_dnd_column %}
  {% end_dnd_section %}
{% end_dnd_area %}
```

### Module inclusion

Include modules in templates:

```hubl
{% module "module_id" path="../modules/component.module" %}
```

## Functions

Common HubL functions:

- `get_asset_url("path")` - Get asset URL
- `require_css(url)` - Include CSS
- `require_js(url)` - Include JavaScript
- `resize_image_url(url, width, height)` - Resize image URL

Example:
```hubl
{{ require_css(get_asset_url("../../css/main.css")) }}
```

## Advanced features

### Raw blocks

Prevent HubL interpretation:
```hubl
{% raw %}
  {{ This won't be processed }}
{% endraw %}
```

### Do statements

Execute code without output:
```hubl
{% do module.link.update({ text: 'Updated' }) %}
```

### Global partials

Include global partials:
```hubl
{% global_partial path="../partials/footer.html" %}
```

## Field access patterns

Access theme and module fields:

**Theme fields:**
```hubl
{{ theme.settings.fonts.primary }}
{{ widget_data.animated_page.value }}
```

**Module fields:**
```hubl
{{ module.title }}
{{ module.style.spacing.padding.top.value }}
```

**Field groups:**
```hubl
{% for cta in module.ctas %}
  {{ cta.text }}
  {{ cta.link.url.href }}
{% endfor %}
```

## Best practices

- Use `escape_html`, `escape_url`, or `escape_attr` filters for user
  content
- Access nested fields using dot notation
- Use `{% set %}` for complex variable assignments
- Prefer `{% include %}` for reusable partials
- Use template inheritance for consistent layouts
- Validate field existence with conditionals before access

## Anti-patterns

- Don't assume full Jinja2 support (HubL is a subset)
- Don't embed client-side JavaScript logic in HubL templates
- Don't access undefined fields without checking existence
- Don't forget to escape user-generated content

## References

For detailed information, see:

- [Filters reference](references/filters.md) - Complete filter documentation
- [Functions reference](references/functions.md) - HubL functions
- [Loops reference](references/loops.md) - For loops, loop properties, nested loops, and cycle tags
- [Variables reference](references/variables.md) - Predefined HubL variables for templates
- [Field types](references/fields.md) - Module and theme field access
