# HubSpot Module Patterns

## fields.js (NOT fields.json)

Uses `@resultify/hubspot-fields-js`. Import shared fields from `src/shared/`.

```js
import { moduleFields as fi, group, init, styleGroup } from '@resultify/hubspot-fields-js';
import spacingFields from '../../../../shared/spacing-fields.js';
import ctaFields from '../../../../shared/cta-fields.js';

init(
  fi.text('Title', 'title', { default: 'Default text' }),
  fi.richtext('Description', 'description', { default: '<p>...</p>' }),
  fi.image('Image', 'image', {
    default: { src: '', alt: '', width: 400, height: 300, size_type: 'auto', loading: 'lazy' }
  }),

  // Repeated items use group with occurrence
  group('Items', 'items', { occurrence: { min: 1, default: 3 } },
    fi.text('Item title', 'title', { default: 'Item' }),
    fi.richtext('Item text', 'text', { default: '' })
  ),

  group('CTA', 'cta', {}, ...ctaFields('Button text')),

  // Style group always last — includes spacing
  styleGroup(
    fi.color('Background color', 'background_color', {
      default: { color: '#FFFFFF', opacity: 100 }
    }),
    ...spacingFields({ disablePadding: false })
  )
);
```

**Field types**: `text`, `richtext`, `image`, `boolean`, `choice`, `color`, `link`, `number`, `spacing`, `alignment`
**Shared fields**: Import from `src/shared/` — do NOT recreate CTA, spacing, or title fields manually.
**Group with occurrence**: For repeated items (cards, list items, testimonials, FAQ items).

**Path depth** from `components/{name}.module/`:
- Shared fields: `../../../../shared/`
- Partials: `../../../partials/`
- Images: `../../../images/modules/{module-name}/`

If nested in subfolder, add one more `../` to each path.

## module.html — Spacing + Partials

```html
{% set spacing = {
  spacing: module.style.spacing,
  enable_spacing_on_mobile: module.style.enable_spacing_on_mobile,
  spacing_mobile: module.style.spacing_mobile
} %}
{% include "../../../partials/spacing.html" %}

<div class="module-{name} {{ spacingClasses }}" style="{{ spacingStyles }}">
  <!-- content -->
</div>
```

### Link rendering
```html
{% set linkRenderer = {
  link: item.link, icon: item.icon,
  text_content: item.text|escape_html,
  class: 'module-{name}__link btn btn--{{ item.link_style }}',
  aria: { 'aria-label': item.text|escape_html }
} %}
{% include "../../../partials/link-renderer.html" %}
```

### Image rendering
```html
{% set imageRenderer = module.image %}
{% do imageRenderer.update({ class: 'module-{name}__image' }) %}
{% include "../../../partials/image-renderer.html" %}
```

## meta.json

```json
{
  "label": "Module Name",
  "global": false,
  "host_template_types": ["PAGE", "BLOG_LISTING", "BLOG_POST"],
  "is_available_for_new_content": true,
  "icon": "../../../images/module-icons/{name}.svg"
}
```

## Image default in fields.js

```js
fi.image('Hero image', 'hero_image', {
  default: {
    src: '../../../images/modules/{module-name}/hero.webp',
    alt: 'Hero', width: 1440, height: 600,
    size_type: 'auto', loading: 'lazy',
  },
})
```
