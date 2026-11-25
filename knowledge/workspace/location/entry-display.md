---
type: Workspace Key
title: Entry display
description: Keys that title, lay out, group and conditionally skip infoj entries in a location view; use with any entry type.
resource: ../../../apps/ui/lib/locations/infoj.mjs
tags: [workspace, location, infoj, ui]
status: draft
x-xyz-keys:
  - { key: entry.title, type: string }
  - { key: entry.label, type: string }
  - { key: entry.inline, type: boolean }
  - { key: entry.class, type: string }
  - { key: entry.css_title, type: string }
  - { key: entry.css_val, type: string }
  - { key: entry.tooltip, type: string }
  - { key: entry.prefix, type: string }
  - { key: entry.suffix, type: string }
  - { key: entry.group, type: string }
  - { key: entry.groupClassList, type: string, requires: [entry.group] }
  - { key: entry.skipEntry, type: boolean }
  - { key: entry.skipNullValue, type: boolean }
  - { key: entry.skipFalsyValue, type: boolean }
  - { key: entry.skipUndefinedValue, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: infoj
    resource: ../../../apps/ui/lib/locations/infoj.mjs
  - resource: ../../../apps/ui/lib/locations/entries/title.mjs
  - resource: ../../../apps/ui/lib/elements/drawer.mjs
  - resource: ../../../apps/ui/tests/locations/infoj.test.mjs
---
# Entry display

The location view is a grid. Each entry is a row with an optional title and
its value.[^infoj]

- `title` is shown before the value; `inline` puts both on one line.
  `tooltip` adds an info icon with the text. `label` labels checkboxes and
  buttons of some entry types.
- `prefix` and `suffix` are shown around a text or numeric value, eg. a unit.
- `class` is added to the entry element; `css_title` and `css_val` are inline
  CSS for the title and the value.
- `group` collects entries with the same group name into a drawer headed by
  the name; `groupClassList` adds classes to the drawer. Groups start
  collapsed; `"groupClassList": "expanded"` opens one. An `expanded` key is
  documented in older JSDoc but not read.[^infoj]

## Skipping

- `skipEntry` always skips the entry, eg. a field needed only by another entry.
- `skipNullValue`, `skipUndefinedValue` and `skipFalsyValue` skip entries
  with such a value, but never editable entries, so a value can still be
  entered.
- `layer.infoj_skip` skips entries by key, field, query, type or group; see
  [location infoj](infoj.md).

# Examples

Address entries grouped in a drawer, empty values skipped.

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
        "infoj": [
          { "title": "Name", "field": "store_name", "css_val": "font-weight: bold" },
          { "title": "Size", "field": "size_band", "inline": true, "tooltip": "Sales area band" },
          { "title": "Street", "field": "add_one", "group": "Address", "groupClassList": "expanded", "skipNullValue": true },
          { "title": "Town", "field": "town", "group": "Address", "skipNullValue": true },
          { "title": "Postcode", "field": "postcode", "group": "Address", "skipNullValue": true }
        ]
      }
    }
  }
}
```

[^infoj]: ui locations/infoj.mjs
