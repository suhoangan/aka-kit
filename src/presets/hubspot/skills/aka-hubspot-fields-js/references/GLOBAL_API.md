## Global API – hubspot-fields-js

---

### group

**Define**
Create a group with fields inside

**Type**
function

**Parameters**

| Name      | Type                                  | Description                |
| --------- | ------------------------------------- | -------------------------- |
| label     | string                                | Group label                |
| name      | string                                | Group name (HubL variable) |
| fields    | BASE_FIELDS \| GROUP_FIELD (optional) | Group settings             |
| childrens | CHILDRENS <repeatable>                | Child fields               |

**Returns**
COMMON_FIELDS

**Example**
@@@
group('Group Label', 'group_name', { …options },
fi.text('Text', 'text'),
fi.image('Image', 'image')
)
@@@

---

### init

**Define**
Initialize all fields and write to a `fields.json` file

**Type**
async function

**Parameters**

| Name   | Type                   | Description          |
| ------ | ---------------------- | -------------------- |
| fields | CHILDRENS <repeatable> | Field or group items |

**Returns**
undefined

**Example**
@@@
import { init, group, styleGroup, moduleFields as fi } from '@resultify/hubspot-fields-js'

init(
styleGroup(
fi.color('Color', 'color_field')
),
group('Content Group', 'content_group', {},
fi.text('Text', 'text_field')
),
fi.link('Link', 'link_field')
)
@@@

---

### styleGroup

**Define**
Create a style group container for fields

**Type**
function

**Parameters**

| Name      | Type                   | Description  |
| --------- | ---------------------- | ------------ |
| childrens | CHILDRENS <repeatable> | Group fields |

**Returns**
COMMON_FIELDS

**Example**
@@@
styleGroup(
fi.color('Primary Color', 'primary_color'),
fi.spacing('Spacing', 'spacing')
)
@@@

---

## Types used in Global API

---

### COMMON_FIELDS

**Define**
Required fields for group/module elements

**Type**
Object

**Properties**

| Name     | Type                            | Description         |
| -------- | ------------------------------- | ------------------- |
| name     | string                          | Field or group name |
| label    | string                          | Display label       |
| type     | string                          | HubSpot field type  |
| tab      | string (optional)               | Content / Style tab |
| children | Array<COMMON_FIELDS> (optional) | Nested children     |

---

### CSS_UNIT

**Define**
CSS measurement units

**Type**
Union

**Values**
@@@
'px' | 'pt' | 'em' | 'rem' | '%' | 'ex' | 'ch' | 'vh' | 'vmax' | 'vmin' | 'vw'
@@@

---

### TEXT_STYLES

**Define**
Text styling options

**Type**
Object

**Properties**

| Name              | Type                             | Description       |
| ----------------- | -------------------------------- | ----------------- |
| `text-decoration` | 'underline' \| 'none' (optional) | Underline or none |
| `font-style`      | 'italic' \| 'normal' (optional)  | Italic or normal  |
| `font-weight`     | 'bold' \| 'normal' (optional)    | Bold or normal    |

---

### CHILDRENS

**Define**
List of fields or groups

**Type**
Array\<COMMON_FIELDS\>

---
