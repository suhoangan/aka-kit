## HubSpot Fields API Methods Reference

Type is defined in [TYPES.md](./TYPES.md)

---

### alignment

**Define**
Alignment field

**Type**
static

**Parameters**

| Name   | Type                                      | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| label  | string                                    | Field label                |
| name   | string                                    | Field name (HubL variable) |
| fields | BASE_FIELDS \| ALIGNMENT_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.alignment('label', 'name', { ...options });
```

---

### audioplayer

**Define**
Audioplayer field

**Type**
static

**Parameters**

| Name   | Type                                  | Description                |
| ------ | ------------------------------------- | -------------------------- |
| label  | string                                | Field label                |
| name   | string                                | Field name (HubL variable) |
| fields | BASE_FIELDS \| AUDIO_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.audioplayer('label', 'name', { ...options });
```

---

### backgroundimage

**Define**
Background image field

**Type**
static

**Parameters**

| Name   | Type                                             | Description                |
| ------ | ------------------------------------------------ | -------------------------- |
| label  | string                                           | Field label                |
| name   | string                                           | Field name (HubL variable) |
| fields | BASE_FIELDS \| BACKGROUND_IMAGE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.backgroundimage('label', 'name', { ...options });
```

---

### blog

**Define**
Blog field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| BLOG_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.blog('label', 'name', { ...options });
```

---

### boolean

**Define**
Boolean field

**Type**
static

**Parameters**

| Name   | Type                                    | Description                |
| ------ | --------------------------------------- | -------------------------- |
| label  | string                                  | Field label                |
| name   | string                                  | Field name (HubL variable) |
| fields | BASE_FIELDS \| BOOLEAN_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.boolean('label', 'name', { ...options });
```

---

### border

**Define**
Border field

**Type**
static

**Parameters**

| Name   | Type                                   | Description                |
| ------ | -------------------------------------- | -------------------------- |
| label  | string                                 | Field label                |
| name   | string                                 | Field name (HubL variable) |
| fields | BASE_FIELDS \| BORDER_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.border('label', 'name', { ...options });
```

---

### choice

**Define**
Choice field

**Type**
static

**Parameters**

| Name   | Type                                   | Description                |
| ------ | -------------------------------------- | -------------------------- |
| label  | string                                 | Field label                |
| name   | string                                 | Field name (HubL variable) |
| fields | BASE_FIELDS \| CHOICE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.choice('label', 'name', { ...options });
```

---

### color

**Define**
Color field

**Type**
static

**Parameters**

| Name   | Type                                  | Description                |
| ------ | ------------------------------------- | -------------------------- |
| label  | string                                | Field label                |
| name   | string                                | Field name (HubL variable) |
| fields | BASE_FIELDS \| COLOR_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.color('label', 'name', { ...options });
```

---

### crmobject

**Define**
CRM object field

**Type**
static

**Parameters**

| Name   | Type                                       | Description                |
| ------ | ------------------------------------------ | -------------------------- |
| label  | string                                     | Field label                |
| name   | string                                     | Field name (HubL variable) |
| fields | BASE_FIELDS \| CRM_OBJECT_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.crmobject('label', 'name', { ...options });
```

---

### crmobjectproperty

**Define**
CRM object property field

**Type**
static

**Parameters**

| Name   | Type                                                | Description                |
| ------ | --------------------------------------------------- | -------------------------- |
| label  | string                                              | Field label                |
| name   | string                                              | Field name (HubL variable) |
| fields | BASE_FIELDS \| CRM_OBJECT_PROPERTY_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.crmobjectproperty('label', 'name', { ...options });
```

---

### cta

**Define**
CTA field

**Type**
static

**Parameters**

| Name   | Type                                | Description                |
| ------ | ----------------------------------- | -------------------------- |
| label  | string                              | Field label                |
| name   | string                              | Field name (HubL variable) |
| fields | BASE_FIELDS \| CTA_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.cta('label', 'name', { ...options });
```

---

### date

**Define**
Date field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| DATE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.date('label', 'name', { ...options });
```

---

### datetime

**Define**
Datetime field

**Type**
static

**Parameters**

| Name   | Type                                          | Description                |
| ------ | --------------------------------------------- | -------------------------- |
| label  | string                                        | Field label                |
| name   | string                                        | Field name (HubL variable) |
| fields | BASE_FIELDS \| DATE_AND_TIME_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.datetime('label', 'name', { ...options });
```

---

### email

**Define**
Email address field

**Type**
static

**Parameters**

| Name   | Type                                          | Description                |
| ------ | --------------------------------------------- | -------------------------- |
| label  | string                                        | Field label                |
| name   | string                                        | Field name (HubL variable) |
| fields | BASE_FIELDS \| EMAIL_ADDRESS_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.email('label', 'name', { ...options });
```

---

### embed

**Define**
Embedded content field

**Type**
static

**Parameters**

| Name   | Type                                    | Description                |
| ------ | --------------------------------------- | -------------------------- |
| label  | string                                  | Field label                |
| name   | string                                  | Field name (HubL variable) |
| fields | BASE_FIELDS \| EMBEDED_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.embed('label', 'name', { ...options });
```

---

### file

**Define**
File upload field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| FILE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.file('label', 'name', { ...options });
```

---

### font

**Define**
Font field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| FONT_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.font('label', 'name', { ...options });
```

---

### form

**Define**
Form field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| FORM_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.form('label', 'name', { ...options });
```

---

### gradient

**Define**
Gradient field

**Type**
static

**Parameters**

| Name   | Type                                     | Description                |
| ------ | ---------------------------------------- | -------------------------- |
| label  | string                                   | Field label                |
| name   | string                                   | Field name (HubL variable) |
| fields | BASE_FIELDS \| GRADIENT_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.gradient('label', 'name', { ...options });
```

---

### html

**Define**
HTML content field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| HTML_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.html('label', 'name', { ...options });
```

---

### hubdbrow

**Define**
HubDB row picker field

**Type**
static

**Parameters**

| Name   | Type                                      | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| label  | string                                    | Field label                |
| name   | string                                    | Field name (HubL variable) |
| fields | BASE_FIELDS \| HUBDB_ROW_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.hubdbrow('label', 'name', { ...options });
```

---

### hubdbtable

**Define**
HubDB table picker field

**Type**
static

**Parameters**

| Name   | Type                                        | Description                |
| ------ | ------------------------------------------- | -------------------------- |
| label  | string                                      | Field label                |
| name   | string                                      | Field name (HubL variable) |
| fields | BASE_FIELDS \| HUBDB_TABLE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.hubdbtable('label', 'name', { ...options });
```

---

### hubl

**Define**
HubL code field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| HUBL_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.hubl('label', 'name', { ...options });
```

---

### icon

**Define**
Icon field

**Type**
static

**Parameters**

| Name   | Type                                 | Description                |
| ------ | ------------------------------------ | -------------------------- |
| label  | string                               | Field label                |
| name   | string                               | Field name (HubL variable) |
| fields | BASE_FIELDS \| ICON_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.icon('label', 'name', { ...options });
```

---

### image

**Define**
Image selector field

**Type**
static

**Parameters**

| Name   | Type                                  | Description                |
| ------ | ------------------------------------- | -------------------------- |
| label  | string                                | Field label                |
| name   | string                                | Field name (HubL variable) |
| fields | BASE_FIELDS \| IMAGE_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.image('label', 'name', { ...options });
```

---

### textalignment

**Define**
Text alignment field

**Type**
static

**Parameters**

| Name   | Type                                           | Description                |
| ------ | ---------------------------------------------- | -------------------------- |
| label  | string                                         | Field label                |
| name   | string                                         | Field name (HubL variable) |
| fields | BASE_FIELDS \| TEXT_ALIGNMENT_FIELD (optional) | Field options              |

**Returns**
COMMON_FIELDS

**Example**

```javascript
fi.textalignment('label', 'name', { ...options });
```
