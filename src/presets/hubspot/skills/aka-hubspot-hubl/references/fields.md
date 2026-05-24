# HubL Field Access Reference

Guide to accessing module and theme fields in HubL templates.

## Module fields

Access module fields through the `module` object:

```hubl
{{ module.title }}
{{ module.description }}
{{ module.image.src }}
```

### Nested fields

Access nested fields using dot notation:

```hubl
{{ module.style.spacing.padding.top.value }}
{{ module.style.alignment.horizontal_align }}
{{ module.link.url.href }}
```

### Field groups

Iterate over field groups:

```hubl
{% for cta in module.ctas %}
  {{ cta.text }}
  {{ cta.link.url.href }}
{% endfor %}
```

### Conditional field access

Check field existence before access:

```hubl
{% if module.title %}
  <h2>{{ module.title }}</h2>
{% endif %}

{% if module.image.src %}
  <img src="{{ module.image.src }}" alt="{{ module.image.alt }}" />
{% endif %}
```

## Theme fields

Access theme-level fields:

```hubl
{{ theme.settings.fonts.primary }}
{{ theme.settings.colors.primary }}
```

### Widget data

Access widget/boolean fields:

```hubl
{{ widget_data.animated_page.value }}
{% if widget_data.animated_page.value %}
  {# Animated page content #}
{% endif %}
```

## Field types and access patterns

### Text fields
```hubl
{{ module.title }}
{{ module.description|escape_html }}
```

### Rich text fields
```hubl
{{ module.content }}
{{ module.content|strip_html }}
```

### Image fields
```hubl
{{ module.image.src }}
{{ module.image.alt }}
{{ module.image.width }}
{{ module.image.height }}
```

### Link fields
```hubl
{{ module.link.url.href }}
{{ module.link.url.type }}
{{ module.link.open_in_new_tab }}
{{ module.link.no_follow }}
```

### Spacing fields
```hubl
{{ module.style.spacing.padding.top.value }}
{{ module.style.spacing.padding.top.units }}
{{ module.style.spacing.margin.bottom.value }}
```

### Choice fields
```hubl
{{ module.link_style }}
{{ module.style.alignment.horizontal_align }}
```

### Boolean fields
```hubl
{% if module.enable_feature %}
  {# Feature enabled #}
{% endif %}
```

### Number fields
```hubl
{{ module.count }}
{{ module.duration }}
```

## Field visibility

Fields with visibility conditions are only accessible when conditions are
met. Always check field existence:

```hubl
{% if module.conditional_field %}
  {{ module.conditional_field }}
{% endif %}
```

## Reference

For field type definitions and configuration, see:
https://developers.hubspot.com/docs/cms/reference/fields/overview
