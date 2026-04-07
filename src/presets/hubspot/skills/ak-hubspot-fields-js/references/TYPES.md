## HubSpot Fields – Types Reference

---

### ADVANCED_VISIBILITY

**Define**
Advanced visibility configuration

**Type**
Object

**Properties**

| Name             | Type                                           | Description            |
| ---------------- | ---------------------------------------------- | ---------------------- |
| boolean_operator | 'AND' \| 'OR'                                  | Operator between rules |
| criteria         | Array<ADVANCED_VISIBILITY_CRITERIA> (optional) | Visibility rules       |
| children         | Array<ADVANCED_VISIBILITY> (optional)          | Nested visibility      |

---

### ADVANCED_VISIBILITY_CRITERIA

**Define**
Single visibility rule

**Type**
Object

**Properties**

| Name                    | Type                                                                | Description  |
| ----------------------- | ------------------------------------------------------------------- | ------------ |
| controlling_field_path  | string                                                              | Field path   |
| operator                | 'EQUAL' \| 'NOT_EQUAL' \| 'EMPTY' \| 'NOT_EMPTY' \| 'MATCHES_REGEX' | Operator     |
| controlling_value_regex | string (optional)                                                   | Regex value  |
| property                | string (optional)                                                   | CRM property |

---

### BASE_FIELDS

**Define**
Base configuration shared by all fields

**Type**
Object

**Properties**

| Name                | Type                           | Description       |
| ------------------- | ------------------------------ | ----------------- |
| label               | string (optional)              | Field label       |
| help_text           | string (optional)              | Help text         |
| inline_help_text    | string (optional)              | Inline help       |
| required            | boolean (optional)             | Required          |
| locked              | boolean (optional)             | Locked            |
| display_width       | 'half_width' (optional)        | Layout width      |
| occurrence.min      | number (optional)              | Min occurrences   |
| occurrence.max      | number (optional)              | Max occurrences   |
| sorting_label_field | string (optional)              | Sorting field     |
| hidden_subfields    | HIDDEN_SUBFIELDS (optional)    | Hidden fields     |
| visibility          | VISIBILITY (optional)          | Simple visibility |
| visibility_rules    | 'ADVANCED' (optional)          | Enable advanced   |
| advanced_visibility | ADVANCED_VISIBILITY (optional) | Advanced rules    |

---

### VISIBILITY

**Define**
Simple visibility rules

**Type**
Object

**Properties**

| Name                    | Type                   | Description |
| ----------------------- | ---------------------- | ----------- |
| controlling_field_path  | string                 | Field path  |
| controlling_value_regex | string                 | Regex       |
| operator                | 'EQUAL' \| 'NOT_EQUAL' | Operator    |

---

### HIDDEN_SUBFIELDS

**Define**
Subfields to hide

**Type**
Array<string>

---

### ALIGNMENT_FIELD

**Define**
Alignment options

**Type**
Object

**Properties**

| Name                     | Type                                 | Description |
| ------------------------ | ------------------------------------ | ----------- |
| alignment_direction      | 'HORIZONTAL' \| 'VERTICAL' \| 'BOTH' |
| default.horizontal_align | 'LEFT' \| 'CENTER' \| 'RIGHT'        |
| default.vertical_align   | 'TOP' \| 'MIDDLE' \| 'BOTTOM'        |

---

### AUDIO_FIELD

**Define**
Audio field options

**Type**
Object

**Properties**

| Name                   | Type   | Description |
| ---------------------- | ------ | ----------- |
| default.file_id        | number |
| default.file_url       | string |
| default.file_extension | string |
| default.file_duration  | number |
| default.title          | string |

---

### BACKGROUND_IMAGE_FIELD

**Define**
Background image options

**Type**
Object

**Properties**

| Name                        | Type   | Description |
| --------------------------- | ------ | ----------- |
| default.src                 | string |
| default.background_size     | string |
| default.background_position | string |

---

### BLOG_FIELD

**Define**
Blog selector

**Type**
Object

**Properties**

| Name        | Type                    | Description |
| ----------- | ----------------------- | ----------- |
| placeholder | string                  |
| default     | number \| Array<number> |

---

### BOOLEAN_FIELD

**Define**
Boolean toggle

**Type**
Object

**Properties**

| Name    | Type                   | Description |
| ------- | ---------------------- | ----------- |
| default | boolean                |
| display | 'toggle' \| 'checkbox' |

---

### BORDER_FIELD

**Define**
Border config

**Type**
Object

**Properties**

| Name                        | Type        | Description |
| --------------------------- | ----------- | ----------- |
| allow_custom_border_sides   | boolean     |
| default.top                 | BORDER_SIDE |
| default.right               | BORDER_SIDE |
| default.bottom              | BORDER_SIDE |
| default.left                | BORDER_SIDE |
| default.border_radius.value | number      |
| default.border_radius.units | CSS_UNIT    |

---

### BORDER_SIDE

**Define**
Single border side

**Type**
Object

**Properties**

| Name        | Type     | Description |
| ----------- | -------- | ----------- |
| width.value | number   |
| width.units | CSS_UNIT |
| style       | string   |
| color       | string   |
| opacity     | number   |

---

### CHOICE_FIELD

**Define**
Choice/select options

**Type**
Object

**Properties**

| Name               | Type                              | Description |
| ------------------ | --------------------------------- | ----------- |
| choices            | Array<Array<string>>              |
| default            | string \| number \| Array         |
| display            | 'select' \| 'radio' \| 'checkbox' |
| multiple           | boolean                           |
| placeholder        | string                            |
| reordering_enabled | boolean                           |

---

### COLOR_FIELD

**Define**
Color picker

**Type**
Object

**Properties**

| Name            | Type    | Description |
| --------------- | ------- | ----------- |
| show_opacity    | boolean |
| default.color   | string  |
| default.opacity | number  |
| default.hex     | string  |
| default.rgb     | string  |
| default.rgba    | string  |

---

### CRM_OBJECT_FIELD

**Define**
CRM object selector

**Type**
Object

**Properties**

| Name                | Type          | Description |
| ------------------- | ------------- | ----------- |
| object_type         | string        |
| properties_to_fetch | Array<string> |
| display_properties  | Array<string> |
| placeholder         | string        |
| default.id          | number        |

---

### CRM_OBJECT_PROPERTY_FIELD

**Define**
CRM property selector

**Type**
Object

**Properties**

| Name             | Type   | Description |
| ---------------- | ------ | ----------- |
| object_type      | string |
| placeholder      | string |
| default.property | string |

---

### CTA_FIELD

**Define**
CTA selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |

---

### DATE_FIELD

**Define**
Date picker

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### DATE_AND_TIME_FIELD

**Define**
Datetime picker

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### EMAIL_ADDRESS_FIELD

**Define**
Email input

**Type**
Object

**Properties**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| placeholder | string |
| default     | string |

---

### EMBEDED_FIELD

**Define**
Embed code

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### FILE_FIELD

**Define**
File selector

**Type**
Object

**Properties**

| Name             | Type   | Description |
| ---------------- | ------ | ----------- |
| default.file_id  | number |
| default.file_url | string |

---

### FONT_FIELD

**Define**
Font selector

**Type**
Object

**Properties**

| Name              | Type     | Description |
| ----------------- | -------- | ----------- |
| default.font      | string   |
| default.size      | number   |
| default.size_unit | CSS_UNIT |

---

### FORM_FIELD

**Define**
Form embed

**Type**
Object

**Properties**

| Name                  | Type   | Description |
| --------------------- | ------ | ----------- |
| default.form_id       | string |
| default.response_type | string |
| default.redirect_url  | string |
| default.message       | string |

---

### GRADIENT_FIELD

**Define**
Gradient options

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | Object |

---

### HTML_FIELD

**Define**
HTML editor

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### HUBDB_ROW_FIELD

**Define**
HubDB row picker

**Type**
Object

**Properties**

| Name     | Type   | Description |
| -------- | ------ | ----------- |
| table_id | number |
| default  | number |

---

### HUBDB_TABLE_FIELD

**Define**
HubDB table picker

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |

---

### HUBL_FIELD

**Define**
HubL editor

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### ICON_FIELD

**Define**
Icon selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### IMAGE_FIELD

**Define**
Image selector

**Type**
Object

**Properties**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| default.src | string |
| default.alt | string |

---

### LINK_FIELD

**Define**
Link selector

**Type**
Object

**Properties**

| Name                    | Type    | Description |
| ----------------------- | ------- | ----------- |
| default.url             | string  |
| default.open_in_new_tab | boolean |

---

### LOGO_FIELD

**Define**
Logo selector

**Type**
Object

**Properties**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| default.src | string |

---

### MEETING_FIELD

**Define**
Meeting link

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### MENU_FIELD

**Define**
Menu selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### NUMBER_FIELD

**Define**
Number input

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |
| min     | number |
| max     | number |

---

### PAGE_FIELD

**Define**
Page selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |

---

### PAYMENT_FIELD

**Define**
Payment selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |

---

### PODCAST_FIELD

**Define**
Podcast selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |

---

### RICHTEXT_FIELD

**Define**
Rich text editor

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### SIMPLE_MENU_FIELD

**Define**
Simple menu

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### SPACING_FIELD

**Define**
Spacing control

**Type**
Object

**Properties**

| Name            | Type   | Description |
| --------------- | ------ | ----------- |
| default.margin  | Object |
| default.padding | Object |

---

### TAG_FIELD

**Define**
Tag selector

**Type**
Object

**Properties**

| Name    | Type          | Description |
| ------- | ------------- | ----------- |
| default | Array<string> |

---

### TEXT_FIELD

**Define**
Plain text input

**Type**
Object

**Properties**

| Name        | Type   | Description |
| ----------- | ------ | ----------- |
| default     | string |
| placeholder | string |

---

### TEXT_ALIGNMENT_FIELD

**Define**
Text alignment

**Type**
Object

**Properties**

| Name    | Type                          | Description |
| ------- | ----------------------------- | ----------- |
| default | 'left' \| 'center' \| 'right' |

---

### URL_FIELD

**Define**
URL input

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | string |

---

### VIDEO_FIELD

**Define**
Video selector

**Type**
Object

**Properties**

| Name    | Type   | Description |
| ------- | ------ | ----------- |
| default | number |
