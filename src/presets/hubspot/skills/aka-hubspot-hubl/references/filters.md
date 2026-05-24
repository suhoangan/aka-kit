# HubL Filters Reference

Complete reference for HubL filters used to transform values in templates.

## String filters

### escape_html
Escapes HTML entities in strings.

```hubl
{{ module.text|escape_html }}
```

### escape_url
URL-encodes strings for use in URLs.

```hubl
{{ module.link.url.href|escape_url }}
```

### escape_attr
Escapes strings for use in HTML attributes.

```hubl
<img alt="{{ module.alt|escape_attr }}" />
```

### lower
Converts string to lowercase.

```hubl
{{ module.style.alignment|lower }}
```

### upper
Converts string to uppercase.

```hubl
{{ module.text|upper }}
```

### replace
Replaces occurrences of a substring.

```hubl
{{ module.anchor_link|replace(' ', '-') }}
```

### default
Provides a default value if the variable is empty or undefined.

```hubl
{{ module.title|default('Default Title') }}
```

### truncate
Truncates a string to a specified length.

```hubl
{{ module.description|truncate(100) }}
```

### strip_html
Removes HTML tags from a string.

```hubl
{{ module.richtext|strip_html }}
```

### urlencode
URL-encodes a string (alias for escape_url).

```hubl
{{ module.query|urlencode }}
```

## Number filters

### abs
Returns absolute value of a number.

```hubl
{{ -5|abs }}  {# outputs: 5 #}
```

### round
Rounds a number to the nearest integer.

```hubl
{{ 3.7|round }}  {# outputs: 4 #}
```

## Array filters

### first
Returns the first element of an array.

```hubl
{{ module.items|first }}
```

### last
Returns the last element of an array.

```hubl
{{ module.items|last }}
```

### length
Returns the length of an array or string.

```hubl
{{ module.items|length }}
```

### join
Joins array elements with a separator.

```hubl
{{ module.tags|join(', ') }}
```

## Date filters

### datetimeformat
Formats a datetime value.

```hubl
{{ content.publish_date|datetimeformat('%B %d, %Y') }}
```

## Reference

For the complete and up-to-date filter list, consult the official HubSpot
documentation:
https://developers.hubspot.com/docs/cms/hubl/filters
