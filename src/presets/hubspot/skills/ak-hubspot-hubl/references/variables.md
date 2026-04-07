# HubL Variables Reference

Complete reference for predefined HubL variables available in HubSpot templates.

## Overview

HubSpot templates can use predefined variables to render website and email
elements. Most variables are optional, but some are required for creating
emails and pages.

Use the `pprint` filter to inspect variable contents:

```hubl
{% set variable = content %}
{{ variable|pprint }}
```

## Variables available in all templates

These variables can be used in email, page, or blog templates.

### Content variables

| Variable                    | Type   | Description                                    |
| --------------------------- | ------ | ---------------------------------------------- |
| `content`                   | Object | Current content object (page, blog post, etc.) |
| `content.name`              | String | Name of the content                            |
| `content.publish_date`      | Date   | Publication date                               |
| `content.updated`            | Date   | Last update date                                |
| `content.slug`               | String | URL slug                                        |
| `content.absolute_url`       | String | Full URL to the content                        |

### Page meta variables

| Variable                          | Type   | Description                    |
| --------------------------------- | ------ | ------------------------------ |
| `page_meta.html_title`            | String | HTML title tag content         |
| `page_meta.meta_description`      | String | Meta description               |
| `page_meta.canonical_url`          | String | Canonical URL                  |
| `page_meta.featured_image_url`    | String | Featured image URL             |
| `page_meta.featured_image_alt`    | String | Featured image alt text        |

### Brand settings

| Variable                      | Type   | Description                    |
| ----------------------------- | ------ | ------------------------------ |
| `brand_settings.primaryFavicon` | Object | Primary favicon settings       |
| `brand_settings.primaryFavicon.src` | String | Favicon URL                |

### Standard includes

| Variable                    | Type   | Description                    |
| --------------------------- | ------ | ------------------------------ |
| `standard_header_includes`  | String | Standard header includes       |
| `standard_footer_includes`  | String | Standard footer includes       |

## Page template variables

Variables specific to page templates.

### Widget data

Access widget/boolean fields:

```hubl
{{ widget_data.animated_page.value }}
{% if widget_data.animated_page.value %}
  {# Animated page content #}
{% endif %}
```

### Built-in body classes

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `builtin_body_classes` | String | Built-in CSS classes for body |

### HTML attributes

| Variable        | Type   | Description                    |
| --------------- | ------ | ------------------------------ |
| `html_lang`     | String | HTML lang attribute value      |
| `html_lang_dir` | String | HTML dir attribute value        |

## Module variables

Access module fields through the `module` object:

```hubl
{{ module.title }}
{{ module.style.spacing.padding.top.value }}
{{ module.link.url.href }}
```

## Theme variables

Access theme-level settings:

```hubl
{{ theme.settings.fonts.primary }}
{{ theme.settings.colors.primary }}
```

## Blog template variables

Variables available in blog templates.

### Blog information

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `blog`                | Object | Current blog object            |
| `blog.name`           | String | Blog name                      |
| `blog.description`    | String | Blog description               |
| `blog.absolute_url`   | String | Blog URL                       |

### Blog posts

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `contents`            | List   | List of blog posts              |
| `contents.name`       | String | Post title                      |
| `contents.publish_date` | Date | Publication date             |
| `contents.absolute_url` | String | Post URL                     |

## Email template variables

Variables specific to email templates.

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `email_subject`       | String | Email subject line             |
| `email_preheader`     | String | Email preheader text           |

## Menu variables

Access menu data:

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `menu`                | Object | Menu object                     |
| `menu.items`          | List   | Menu items                      |
| `menu.items.label`    | String | Menu item label                 |
| `menu.items.url`      | String | Menu item URL                   |

## Site tree variables

Access site structure:

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `site_tree`           | Object | Site tree structure            |
| `site_tree.children`  | List   | Child pages                    |

### Node properties

When iterating site tree nodes:

| Variable              | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `node.label`          | String | Node label                      |
| `node.url`            | String | Node URL                        |
| `node.pageTitle`      | String | Page title                      |
| `node.slug`           | String | URL slug                        |
| `node.activeNode`     | Boolean | True if current page          |
| `node.activeBranch`   | Boolean | True if in active branch       |
| `node.level`          | Number | Depth level from top            |
| `node.parentNode`     | Object | Parent node                     |
| `node.children`       | List   | Child nodes                     |

## Editor and preview variables

Check if content is being rendered in an editor or preview:

| Variable                      | Type   | Description                    |
| ----------------------------- | ------ | ------------------------------ |
| `is_in_hs_app`                | String | True if in HubSpot app         |
| `is_in_editor`                | String | True if in any content editor   |
| `is_in_global_content_editor` | String | True if in global content editor |
| `is_in_theme_editor`          | Number | True if in theme editor        |
| `is_in_page_editor`           | String | True if in page editor         |
| `is_in_blog_post_editor`      | String | True if in blog post editor    |
| `is_in_email_editor`          | String | True if in email editor        |
| `is_in_previewer`             | Number | True if in any preview context |
| `is_in_theme_previewer`       | Object | True if in theme previewer     |
| `is_in_template_previewer`    | String | True if in template previewer  |
| `is_in_page_previewer`        | String | True if in page previewer      |
| `is_in_blog_post_previewer`   | String | True if in blog post previewer |
| `is_in_email_previewer`       | String | True if in email previewer    |
| `is_in_module_previewer`      | String | True if in module previewer    |

### Example usage

```hubl
{% if is_in_page_editor %}
  <div>Display something different within the page editor.</div>
{% endif %}

{% if is_in_previewer %}
  {# Preview-specific content #}
{% endif %}
```

## Common usage patterns

**Accessing page meta:**
```hubl
<title>{{ page_meta.html_title or pageTitle }}</title>
<meta name="description" content="{{ page_meta.meta_description }}" />
<link rel="canonical" href="{{ page_meta.canonical_url }}" />
```

**Using brand settings:**
```hubl
{% if brand_settings.primaryFavicon.src %}
  <link rel="shortcut icon" href="{{ brand_settings.primaryFavicon.src }}" />
{% endif %}
```

**Standard includes:**
```hubl
<head>
  {{ standard_header_includes }}
</head>
<body>
  {# Content #}
  {{ standard_footer_includes }}
</body>
```

**Site tree navigation:**
```hubl
<ul>
  {% for node in site_tree.children %}
    <li>
      <a href="{{ node.url }}" {% if node.activeNode %}class="active"{% endif %}>
        {{ node.label }}
      </a>
    </li>
  {% endfor %}
</ul>
```

## Reference

For complete variables documentation, see:
https://developers.hubspot.com/docs/cms/reference/hubl/variables
