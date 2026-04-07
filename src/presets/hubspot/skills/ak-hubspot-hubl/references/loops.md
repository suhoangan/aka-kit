# HubL Loops Reference

Complete reference for HubL for loops used to iterate through sequences of
objects.

## Basic syntax

For loops iterate through sequences and begin with `{% for %}` and end with
`{% endfor %}`:

```hubl
{% for item in items %}
  {{ item }}
{% endfor %}
```

## Loop properties

Access loop metadata using the `loop` variable:

| Variable         | Description                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `loop.cycle`     | Helper function to cycle between a list of sequences                                         |
| `loop.depth`     | How deep in a recursive loop the rendering currently is (starts at level 1)                 |
| `loop.depth0`    | How deep in a recursive loop the rendering currently is (starts at level 0)                 |
| `loop.first`     | Evaluates to `true` if it is the first iteration of the loop                               |
| `loop.index`     | Current iteration of the loop (starts counting at 1)                                        |
| `loop.index0`    | Current iteration of the loop (starts counting at 0)                                        |
| `loop.last`      | Evaluates to `true` if it is the last iteration of the loop                                |
| `loop.length`    | Number of items in the sequence                                                             |
| `loop.revindex`  | Number of iterations from the end of the loop (counting down to 1)                         |
| `loop.revindex0` | Number of iterations from the end of the loop (counting down to 0)                         |

### Examples

**Using loop.index:**
```hubl
{% set items = ["Content", "Social", "Contacts", "Reports"] %}
{% for item in items %}
  {{ loop.index }}. {{ item }}<br>
{% endfor %}
```

Output:
```
1. Content <br>
2. Social <br>
3. Contacts <br>
4. Reports <br>
```

**Using loop.first and loop.last:**
```hubl
{% for item in items %}
  {% if loop.first %}
    <div class="first-item">{{ item }}</div>
  {% elif loop.last %}
    <div class="last-item">{{ item }}</div>
  {% else %}
    <div class="item">{{ item }}</div>
  {% endif %}
{% endfor %}
```

**Using loop.length:**
```hubl
{% for content in contents %}
  {% if loop.length is divisibleby 4 %}
    <div style="width:25%">Post content</div>
  {% elif loop.length is divisibleby 3 %}
    <div style="width:33.33332%">Post content</div>
  {% else %}
    <div style="width:50%">Post content</div>
  {% endif %}
{% endfor %}
```

## Nested loops

Loops can be nested. The child loop runs with each iteration of the parent
loop:

```hubl
{% set parents = ["Parent item 1", "Parent item 2"] %}
{% set children = ["Child item 1", "Child item 2"] %}
<ul>
  {% for parent in parents %}
    <li>{{ parent }}
      <ul>
        {% for child in children %}
          <li>{{ child }}</li>
        {% endfor %}
      </ul>
    </li>
  {% endfor %}
</ul>
```

## Cycle tag

Use `cycle` within a for loop to cycle through a series of string values:

```hubl
{% for content in contents %}
  <div class="post-item {% cycle "odd","even" %}">Blog post content</div>
{% endfor %}
```

Output:
```html
<div class="post-item odd">Blog post content</div>
<div class="post-item even">Blog post content</div>
<div class="post-item odd">Blog post content</div>
```

**Note:** There are no spaces between comma-separated cycle string values.

## Variables within loops

Variables defined within loops are limited to the scope of that loop and
cannot be called from outside the loop. You can call variables defined
outside a loop from within the loop, but not the other way around.

## Key-value pairs in loops

To access both keys and values when looping through a dictionary, use
`.items()`:

```hubl
{% set dict_var = {"name": "Cool Product", "price": "$20", "size": "XL"} %}
{% for key, val in dict_var.items() %}
  {{ key }}: {{ val }}<br>
{% endfor %}
```

Output:
```
name: Cool Product <br>
price: $20 <br>
size: XL <br>
```

## Iterate a set number of times

Use the `range` function to iterate a set number of times:

```hubl
{% for x in range(0, 5) %}
  {{ loop.index }}
{% endfor %}
```

Output:
```
1 2 3 4 5
```

## Using HubL tags in loops

When using tags in loops, add the `unique_in_loop` parameter to generate
unique IDs. This appends the module name with the current loop iteration
number:

```hubl
{% for item in module.icon_field %}
  {% icon
    name="{{ item.name }}",
    style="{{ item.type }}",
    unicode="{{ item.unicode }}",
    unique_in_loop=True
  %}
{% endfor %}
```

## Common patterns

**Iterating module field groups:**
```hubl
{% for cta in module.ctas %}
  <a href="{{ cta.link.url.href }}">{{ cta.text }}</a>
{% endfor %}
```

**Conditional rendering based on loop position:**
```hubl
{% for item in module.items %}
  <div class="item {% if loop.first %}first{% elif loop.last %}last{% endif %}">
    {{ item.name }}
  </div>
{% endfor %}
```

**Alternating classes:**
```hubl
{% for post in blog_recent_posts('default', 5) %}
  <article class="post {% cycle 'even', 'odd' %}">
    <h2>{{ post.name }}</h2>
  </article>
{% endfor %}
```

## Reference

For complete loop documentation, see:
https://developers.hubspot.com/docs/cms/reference/hubl/loops
