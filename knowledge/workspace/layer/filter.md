---
type: Workspace Key
title: Layer filter
description: layer.filter sets the fixed default filter and configures the filter panel built from infoj entries; use when a layer needs filtering.
resource: ../../../apps/ui/lib/layers/panels/filter.mjs
tags: [workspace, layer, filter, ui]
status: draft
x-xyz-keys:
  - key: layer.filter
    type: object
    default: { current: {} }
  - key: layer.filter.default
    type: [object, array, string]
    ref: filter
    requires: [layer.table]
  - key: layer.filter.current
    type: object
    ref: filter
    default: {}
  - { key: layer.filter.viewport, type: boolean }
  - { key: layer.filter.hidden, type: boolean }
  - key: layer.filter.include
    type: array
    requires: [layer.infoj]
  - key: layer.filter.exclude
    type: array
    requires: [layer.infoj]
  - key: layer.filter.includeAll
    type: boolean
    requires: [layer.infoj]
  - key: layer.filter.drawer
    type: [string, boolean]
    default: disableOnHide
  - { key: layer.filter.popout, type: boolean }
  - { key: layer.filter.dialog, type: [object, boolean] }
  - { key: layer.filter.classList, type: string }
  - { key: layer.filter.count_meta, type: string }
  - { key: layer.filter.viewport_description, type: string }
  - { key: layer.multi_filter, type: [boolean, object] }
  - { key: layer.multi_filter.target, type: string }
  - { key: entry.filter, type: [boolean, string, object] }
  - { key: entry.filter.type, type: string }
  - { key: entry.filter.title, type: string }
  - { key: entry.filter.field, type: string }
  - { key: entry.filter.distinct, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: decorate
    resource: ../../../apps/mapp/lib/layer/decorate.mjs
  - id: panel
    resource: ../../../apps/ui/lib/layers/panels/filter.mjs
  - id: filters
    resource: ../../../apps/ui/lib/layers/filters.mjs
  - id: query
    resource: ../../../apps/xyz/mod/query.js
  - resource: ../../../apps/ui/tests/layers/panels/filter.test.mjs
  - resource: ../../../apps/ui/tests/layers/filters.test.mjs
  - resource: ../../../apps/xyz/tests/mod/query.test.mjs
---
# Layer filter

`layer.filter` combines two things: a fixed server-side filter, and the filter
panel through which users narrow a layer in the layer view. Both use
[filter expressions](../filter-expressions.md).

## Server side

- `default` is read by the XYZ API from the workspace layer, not from the
  request, and is applied to every layer query with `${filter}`. A client
  cannot change or remove it.[^query] It may be an expression object, an
  array (`OR`), or a SQL string. A string is inserted as SQL unchanged, so it
  must only come from the workspace.
- `current` is the filter the user applied. The MAPP library sends it with
  layer queries and the API adds it to `default` with `AND`.

## Client side

The MAPP library decorates every layer with `filter: { current: {} }` merged
with the configured object. `viewport` is set to `true` when `layer.params` or
`layer.queryparams` restrict queries to the viewport.[^decorate]

The panel lists a filter for each `layer.infoj` entry which has a `filter`
(true, a type string, or an object with `type`). Without one, an entry is
listed when `includeAll` is set or its field is in `include`. Entries with
`skipEntry`, without `field`, with `filter: false`, or whose field is in
`exclude` are never listed. A missing type is derived from the entry type:
`numeric`, `integer`, `text` → `like`, `date`, `datetime`, `boolean`.[^panel]

Entry filter types are `like`, `match`, `numeric`, `integer`, `in`, `ni`,
`date`, `datetime`, `boolean` and `null`.[^filters] The keys inside
`entry.filter` belong to the location entry concepts.

- `hidden` suppresses the panel; `drawer` defaults to `disableOnHide`;
  `popout`, `dialog` and `classList` change how the panel is shown.
- `count_meta` and `viewport_description` override the dictionary texts next
  to the location count.

## Pitfalls

- An entry filter with an unknown type is skipped with a console warning.
- The legacy `layer.multi_filter` plugin key rewrites the filter
  configuration before the panel is built. Its other keys, such as `target`,
  are read by the plugin, not by the filter panel.[^panel]

# Examples

The devdb retail points with a fixed default filter and a panel offering
retailer, fascia and open date filters. Address fields are excluded.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "retail_points": {
        "display": true,
        "format": "wkt",
        "table": "geodata.uk_glx_open_retail_points",
        "geom": "geom_p_4326",
        "srid": "4326",
        "qID": "id",
        "filter": {
          "default": { "size_band": { "ni": ["< 3,013 ft2 (280m2)"] } },
          "exclude": ["add_one", "add_two"]
        },
        "infoj": [
          { "type": "key" },
          { "title": "Retailer", "field": "retailer", "filter": { "type": "in", "distinct": true } },
          { "title": "Fascia", "field": "fascia", "filter": { "type": "in", "distinct": true } },
          { "title": "Open Date", "field": "open_date", "type": "date", "filter": "date" },
          { "field": "add_one" },
          { "field": "add_two" }
        ]
      }
    }
  }
}
```

[^query]: query.js layerQuery
[^decorate]: decorate.mjs
[^panel]: panels/filter.mjs listFilter, excludeEntry and multi_filter
[^filters]: layers/filters.mjs
