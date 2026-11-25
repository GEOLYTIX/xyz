---
type: Workspace Key
title: Entry filters
description: entry.filter turns an infoj entry into a filter of the layer filter panel; use to choose the filter type and its input.
resource: ../../../apps/ui/lib/layers/filters.mjs
tags: [workspace, layer, filter, infoj, ui]
status: draft
x-xyz-keys:
  - key: entry.filter
    type: [boolean, string, object]
    description: true derives the filter type from entry.type, a string is a filter type, false never lists the entry.
  - key: entry.filter.type
    type: string
    examples: [like, match, numeric, integer, in, ni, date, datetime, boolean, "null"]
    required: true
    description: The mapp.ui.layers.filters method of the panel and the filter expression type it writes. Plugins add values to the registry; see plugin-extensions.md.
  - { key: entry.filter.title, type: string, description: Card title; defaults to entry.title. }
  - { key: entry.filter.field, type: string, description: Column to filter; defaults to entry.field. }
  - { key: entry.filter.label, type: string, description: Checkbox label of boolean and null filters. }
  - { key: entry.filter.meta, type: string, description: Text shown at the top of the filter card. }
  - { key: entry.filter.leading_wildcard, type: boolean, description: A like filter matches anywhere in the value, not only at the start. }
  - { key: entry.filter.in, type: array, description: Values offered by an in filter instead of the distinct values of the field. }
  - { key: entry.filter.ni, type: array, description: Values offered by a ni filter instead of the distinct values of the field. }
  - { key: entry.filter.dropdown, type: boolean, description: in and ni filters show a dropdown instead of checkboxes. }
  - { key: entry.filter.dropdown_pills, type: boolean, description: A dropdown which shows the selected values as pills. }
  - { key: entry.filter.dropdown_search, type: boolean, description: A dropdown with a search input. }
  - { key: entry.filter.searchbox, type: boolean, description: in and ni filters show a searchbox which adds values as pills. }
  - { key: entry.filter.placeholder, type: string, description: Placeholder of the dropdown. }
  - { key: entry.filter.min, type: number, description: Fixed lower bound of a numeric or integer range; queried from the field when unset. }
  - { key: entry.filter.max, type: number, description: Fixed upper bound of a numeric or integer range; queried from the field when unset. }
  - { key: entry.filter.step, type: number, description: Slider step; 1 for integer, 0.01 for numeric. }
  - { key: entry.filter.prefix, type: string, description: Unit shown in the range labels. }
  - { key: entry.filter.suffix, type: string, description: Unit shown in the range labels when there is no prefix. }
  - { key: entry.filter.label_a, type: string, description: Label of the lower range input. }
  - { key: entry.filter.label_b, type: string, description: Label of the upper range input. }
  - key: entry.filter.histogram
    type: [boolean, object]
    open: true
    description: Shows a histogram dataview above a numeric range; an object is merged into the dataview configuration.
  - key: entry.filter.distinct
    type: boolean
    deprecated: true
    description: Not read. in and ni filters query distinct values whenever they have no value array.
sources:
  - id: filters
    resource: ../../../apps/ui/lib/layers/filters.mjs
  - id: panel
    resource: ../../../apps/ui/lib/layers/panels/filter.mjs
  - resource: ../../../apps/ui/lib/elements/dropdown.mjs
  - resource: ../../../apps/ui/lib/elements/slider_ab.mjs
  - resource: ../../../apps/ui/lib/utils/histogram.mjs
  - resource: ../../../apps/ui/tests/layers/filters.test.mjs
  - resource: ../../../apps/ui/tests/layers/panels/filter.test.mjs
---
# Entry filters

An infoj entry with `filter` adds an option to the filter panel of its layer;
see [layer filter](filter.md) for which entries are listed. Selecting it adds
a card, whose input writes a [filter expression](../filter-expressions.md)
for the entry field into `layer.filter.current`.[^filters]

`filter: true` derives the type from `entry.type`:
`text` → `like`, and `numeric`, `integer`, `date`, `datetime` and `boolean`
alike. Other entry types are not listed. An empty object acts like `true`
but fails the strict schema. A string is the type; an object
needs `type`, or it is skipped with a warning, as is an unknown type.[^panel]

| `type` | Input | Writes | Keys |
| --- | --- | --- | --- |
| `like`, `match` | Text input | `like` or `match` with the text | `leading_wildcard` |
| `in`, `ni` | Checkboxes, a dropdown or a searchbox of values | `in` or `ni` with the selected values | `in`, `ni`, `dropdown`, `dropdown_pills`, `dropdown_search`, `searchbox`, `placeholder` |
| `numeric`, `integer` | Range slider and inputs | `gte` and `lte` | `min`, `max`, `step`, `prefix`, `suffix`, `label_a`, `label_b`, `histogram` |
| `date`, `datetime` | Date inputs "after" and "before" | `gt` and `lt` in epoch seconds | |
| `boolean`, `null` | Checkbox | `boolean` or `null` | `label` |

`meta` adds a text to any card.

## Behaviour

- `in` and `ni` without a value array query the distinct values of the field
  with the `distinct_values` template, filtered by the other current filters.
  A configured `in` or `ni` array is offered as is.[^filters]
- A range filter merges its entry, so `entry.min`, `max`, `step`, `prefix`
  and `suffix` apply unless the filter sets them. Bounds which are not set
  are queried with the `field_minmax` template. A range with configured
  bounds filters the layer as soon as the card opens.
- `histogram` draws the built-in `histogram` dataview with the `histogram`
  query template of the field; an object sets `options` or `queryparams`,
  eg. `buckets`.

## Pitfalls

- With `layer.filter.viewport`, the queried minimum and maximum of the
  viewport replace configured `min` and `max`.
- The date filters compare epoch seconds; the column must be numeric epoch
  seconds for them to match.
- `like` matches the start of the value; commas in the input are
  alternatives. `match` compares the full text, so `leading_wildcard` only
  helps `like`.
- `minmax_query` is documented in older JSDoc but not read; the range always
  queries `field_minmax`.

# Examples

A countries layer whose panel filters the name, continent, subregion and
population.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "countries": {
        "display": true,
        "format": "geojson",
        "table": "naturalearth.countries",
        "geom": "geom_4326",
        "srid": "4326",
        "qID": "id",
        "infoj": [
          { "type": "key" },
          { "title": "Name", "field": "name", "filter": { "type": "like", "leading_wildcard": true } },
          {
            "title": "Continent",
            "field": "continent",
            "filter": { "type": "in", "dropdown_pills": true, "placeholder": "Select continents" }
          },
          { "title": "Subregion", "field": "subregion", "filter": { "type": "ni", "searchbox": true } },
          {
            "title": "Population",
            "field": "pop_est",
            "type": "integer",
            "filter": { "type": "integer", "min": 0, "meta": "Estimated population", "histogram": true, "label_a": "At least", "label_b": "At most" }
          }
        ]
      }
    }
  }
}
```

[^filters]: layers/filters.mjs
[^panel]: panels/filter.mjs listFilter
