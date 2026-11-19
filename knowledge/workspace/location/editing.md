---
type: Workspace Key
title: Location editing
description: entry.edit makes infoj entries editable, with options, ranges and geometry drawing; dependents refresh other values after saving; use to let users change locations.
resource: ../../../apps/mapp/lib/location/decorate.mjs
tags: [workspace, location, infoj, edit, ui, security]
status: draft
x-xyz-keys:
  - { key: entry.edit, type: [boolean, object] }
  - { key: entry.edit.options, type: array }
  - { key: entry.edit.radio, type: boolean, requires: [entry.edit.options] }
  - { key: entry.edit.dynamic, type: boolean }
  - { key: entry.edit.query, type: string, default: distinct_values }
  - { key: entry.edit.placeholder, type: string }
  - { key: entry.edit.maxlength, type: integer }
  - { key: entry.edit.arraySeparator, type: string }
  - { key: entry.edit.min, type: number, default: -2147483648 }
  - { key: entry.edit.max, type: number, default: 2147483647 }
  - { key: entry.edit.step, type: number }
  - { key: entry.edit.range, type: boolean }
  - { key: entry.edit.draw, type: object }
  - { key: entry.edit.modify_btn, type: boolean }
  - { key: entry.edit.modify_label, type: string }
  - { key: entry.edit.delete, type: boolean }
  - { key: entry.edit.delete_label, type: string }
  - { key: entry.edit.snap, type: [object, boolean] }
  - { key: entry.dependents, type: array }
  - { key: entry.dependents_layers, type: array }
  - { key: layer.deleteLocation, type: boolean }
  - { key: layer.toggleLocationViewEdits, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: decorate
    resource: ../../../apps/mapp/lib/location/decorate.mjs
  - id: text
    resource: ../../../apps/ui/lib/locations/entries/text.mjs
  - id: numeric
    resource: ../../../apps/ui/lib/locations/entries/numeric.mjs
  - id: view
    resource: ../../../apps/ui/lib/locations/view.mjs
  - resource: ../../../apps/ui/lib/locations/entries/geometry.mjs
  - resource: ../../../apps/xyz/mod/workspace/templates/location_update.js
  - resource: ../../../apps/mapp/tests/location/decorate.test.mjs
---
# Location editing

An entry with `edit` shows an input instead of its value; `edit: true` is the
same as `edit: {}`. Changed values are saved together: the location sends
them to the `location_update` query, then shows them as saved.[^decorate]
Updates of one location run one after another, in order.

Restrict layers with editable entries to the users who edit them with layer
[roles](../roles.md).

## Inputs

- Text: `placeholder`, `maxlength`. `options` turns the input into a
  dropdown, or radio buttons with `radio`. An empty `options` array, or
  `dynamic: true`, loads the options with `edit.query`, `distinct_values` of
  the field by default.[^text] `arraySeparator` splits text into an array.
- Numbers: `min` and `max` bound the value, `step` sets the increment, and
  `range` adds a slider.[^numeric]
- Geometry entries: `draw` enables drawing a new geometry, `modify_btn`
  editing the existing one, `delete` removing it, and `snap` snapping to
  other features; `modify_label` and `delete_label` label the buttons.
- `entry.default` fills a new location's value; see [location infoj](infoj.md).

## After saving

- `dependents` lists fields of the location which are reloaded after this
  entry is saved, eg. values computed by a trigger.
- `dependents_layers` lists layer keys which are reloaded.
- `layer.deleteLocation` adds a delete button to the location view.
- `layer.toggleLocationViewEdits` starts the view read-only, with a button to
  switch editing on.[^view]

## Pitfalls

- `entry.step` sets the step to 1 whenever it is set, because of operator
  precedence in the numeric entry. Use `edit.step`.
- `layer.edit.delete` and `layer.draw.delete` are legacy forms of
  `deleteLocation`.

# Examples

Retailer chosen from the values in the table, and a bounded size field. The
example layer is read in tests; editing writes to the devdb only in a running
view.

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
        "toggleLocationViewEdits": true,
        "infoj": [
          { "title": "Retailer", "field": "retailer", "edit": { "options": [] } },
          { "title": "Name", "field": "store_name", "edit": { "maxlength": 80 } },
          { "title": "Size band", "field": "size_band", "edit": { "options": [], "radio": true }, "dependents": ["pqi"] },
          { "title": "PQI", "field": "pqi" }
        ]
      }
    }
  }
}
```

[^decorate]: mapp location/decorate.mjs update and syncFields
[^text]: ui entries/text.mjs textoptions
[^numeric]: ui entries/numeric.mjs edit
[^view]: ui locations/view.mjs
