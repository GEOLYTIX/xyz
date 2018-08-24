# InfoJ

`"infoj"` is a container for data associated with each feature displayed on selection and interaction that requires reading feature properties. This is an array of objects with the following structure:

```text
"infoj": [
  {
    "field": <field name>,
    "label": <label for the field>, // optional
    "type": <currently supported: "text", "numeric", "integer", "date">,
    "level": <small integer, defines row indent, defaults to 0>,
    "filter": <filter type>,
    "options": <array of drop down values for editable properties>,
    "inline": <boolean, displays table row in one line, defaults to false>
  },
  {
    "label": <set label only when needed a section title>
  },
  {
    "chart": <chart name> // in order to add chart
  },
  {...}
]
```

`"options"` parameter can also support hierarchy of selections:

```text
"options": [
  "parent value 1;child value 1 for value 1;child value 2 for value 1",
  "parent value 2;child value 1 for value 2;child value 1 for value 2",
  (...)
]
```

`infoj` supports groups of items organized in collapsible sections. To define a group type `group` is used:

```text
{
  "label": "Group name",
  "type": "group",
  "items": [] // items takes array of infoj objects described above.
}
```

First value before semicolon will determine subsequent choice.

