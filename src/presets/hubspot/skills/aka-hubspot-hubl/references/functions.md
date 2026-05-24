# HubL Functions Reference

Complete reference for HubL functions used in templates.

## Asset functions

### get_asset_url
Returns the URL for a theme asset.

```hubl
{{ get_asset_url("../../css/main.css") }}
```

### require_css
Includes a CSS file in the page head.

```hubl
{{ require_css(get_asset_url("../../css/main.css")) }}
```

### require_js
Includes a JavaScript file.

```hubl
{{ require_js(get_asset_url("../../js/main.js")) }}
```

## Image functions

### resize_image_url
Generates a resized image URL.

```hubl
{{ resize_image_url(image.src, 800, 600) }}
{{ resize_image_url(image.src, 1, 1) }}  {# Placeholder #}
```

## Content functions

### blog_recent_tag_posts
Gets recent blog posts by tag.

```hubl
{% set posts = blog_recent_tag_posts('default', 'tag-name', 5) %}
```

### blog_popular_posts
Gets popular blog posts.

```hubl
{% set posts = blog_popular_posts('default', 5) %}
```

## Reference

For the complete and up-to-date function list, consult the official HubSpot
documentation:
https://developers.hubspot.com/docs/cms/hubl/functions
