---
name: ak:hubspot-fields-js
description: Create fields.js (instead of fields.json) for HubSpot modules using the hubspot-fields-js library. Use when the project uses hubspot-fields-js and the user asks to create a HubSpot module.
paths:
  - '**/fields.js'
---

# HubSpot Fields JS Skill

This skill covers the **hubspot-fields-js** library, including:

1. API reference for field builder methods
2. Types definitions for all supported field types
3. Global API methods (`group`, `styleGroup`, `init`)
4. Practical examples of how to write field definitions

Use this skill when working with building or maintaining custom HubSpot modules using hubspot-fields-js.

---

## When to use this skill

- You need to **define custom fields** for HubSpot modules programmatically.
- You want to **understand types and field structures** in hubspot-fields-js.
- You are building or debugging **field JSON definitions** for HubSpot themes or modules.
- You need clear **example usage and reference** for each field type and builder function.

---

## Overview of hubspot-fields-js API

### Field Builders

The library exposes a set of static methods to create fields. Each field method returns a HubSpot compatible definition.

**_See [the FIELDS guide](references/FIELDS.md) for details._**

Example usage:

```javascript
fi.text('Title', 'title_field', { placeholder: 'Enter text here' });
```

- `label`: Display label in CMS
- `name`: HubL variable name for the field
- `fields`: Optional configuration object

Refer to the full API below.

---

## Field Builder Reference

### Basic text field

```javascript
fi.text('Text', 'text', { placeholder: 'Enter text' });
```

### Choice field

```javascript
fi.choice('Options', 'options', {
  choices: [
    ['option1', 'Option 1'],
    ['option2', 'Option 2'],
  ],
  multiple: true,
});
```

### Color field

```javascript
fi.color('Color', 'color', { default: { color: '#ffffff' } });
```

_(Full list of methods continues — see the reference section in this skill)_

---

## Types Reference

The following are the structured types used by this library. They define how field settings are organized.

**_See [the TYPES guide](references/TYPES.md) for details._**

### Example: BASE_FIELDS

Base common properties for all fields:

| Property   | Type              | Description                     |
| ---------- | ----------------- | ------------------------------- |
| label      | string            | Display label                   |
| help_text  | string (optional) | Help text shown under the field |
| required   | boolean           | Whether the field is required   |
| visibility | Object            | Simple visibility rules         |

More types include alignment, CRM selectors, media, spacing, and more.

---

## Global API Methods

**_See [the GLOBAL API guide](references/GLOBAL_API.md) for details._**

### group

Create a group of fields:

```javascript
group('Content Group', 'content_group', {}, fi.text('Title', 'title'), fi.image('Image', 'image'));
```

- Useful to organize fields inside a module.

### styleGroup

Group style-related fields:

```javascript
styleGroup(fi.color('Background', 'background_color'), fi.spacing('Spacing', 'spacing'));
```

- Put CSS or style controls here.

### init

Initialize builder into JSON output:

```javascript
init(styleGroup(fi.color('Primary', 'primary_color')), group('Content', 'content', {}, fi.richtext('Body', 'body')));
```

---

## Examples

### Full field definition

A complete example of a module fields definition:

```javascript
init(
  group('Hero Content', 'hero', {}, fi.text('Heading', 'heading'), fi.richtext('Subheading', 'subheading')),
  styleGroup(fi.color('Text Color', 'text_color'), fi.spacing('Margin', 'margin'))
);
```

- This will produce a valid HubSpot fields JSON.

---

## Notes

- This skill **does not include external documentation links**; all relevant API and type details are contained herein.
- If you need **advanced visibility rules**, use the structured types documented in the Types Reference section.
