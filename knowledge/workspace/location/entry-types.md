---
type: Workspace Key
title: Entry types
description: The infoj entry types, what each shows and its type-specific keys; use to choose how a location value is displayed.
resource: ../../../apps/ui/lib/locations/entries/_entries.mjs
tags: [workspace, location, infoj, ui]
status: draft
x-xyz-keys:
  - { key: entry.formatterParams, type: object }
  - { key: entry.url, type: string }
  - { key: entry.report, type: object }
  - { key: entry.icon_name, type: string }
  - { key: entry.hideLayer, type: boolean }
  - { key: entry.pills, type: array }
  - { key: entry.target, type: [string, object] }
  - { key: entry.tab_style, type: string }
  - { key: entry.display, type: boolean }
  - { key: entry.style, type: object }
  - { key: entry.zIndex, type: integer }
  - { key: entry.srid, type: string }
  - { key: entry.layer, type: string }
  - { key: entry.data, type: [object, array] }
  - { key: entry.cloudinary_folder, type: string }
  - { key: entry.max_size, type: integer }
  - { key: entry.alert, type: string }
  - { key: entry.reload, type: boolean }
  - { key: entry.min, type: number, description: Lower bound of numeric and integer entries, for editing and the range filter. }
  - { key: entry.max, type: number, description: Upper bound of numeric and integer entries, for editing and the range filter. }
  - { key: entry.step, type: number, description: Step of the range filter of numeric and integer entries; editing uses edit.step. }
  - { key: entry.dynamic, type: boolean, description: A dataview or tab entry is recreated and updated each time its tab is shown. }
  - { key: entry.disabled, type: boolean, description: The tab of a tab or dataview entry is dimmed and inert; the display toggle of a layer entry is disabled. }
  - { key: entry.disableTabClose, type: boolean, description: The tab of a tab or dataview entry has no close button and no middle click close. }
  - { key: entry.hideTabClose, type: boolean, description: The tab of a tab or dataview entry has no close button. }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: entries
    resource: ../../../apps/ui/lib/locations/entries/_entries.mjs
  - resource: ../../../apps/ui/lib/locations/entries/layer.mjs
  - resource: ../../../apps/ui/lib/locations/entries/query_button.mjs
  - resource: ../../../apps/ui/lib/locations/entries/cloudinary.mjs
  - resource: ../../../apps/ui/lib/locations/entries/numeric.mjs
  - resource: ../../../apps/ui/lib/locations/entries/tab.mjs
  - resource: ../../../apps/ui/lib/Tabview.mjs
  - resource: ../../../apps/ui/tests/locations/entries/_entries.test.mjs
  - resource: ../../../apps/ui/tests/locations/entries/layer.test.mjs
  - resource: ../../../apps/ui/tests/locations/entries/query_button.test.mjs
---
# Entry types

`entry.type` selects the method which renders the entry. An unknown type logs
an error and is skipped.[^entries]

| `type` | Shows | Type keys |
| --- | --- | --- |
| `text` (default) | The value as text | `prefix`, `suffix` |
| `textarea`, `html` | Multi-line text; `html` renders HTML | |
| `numeric`, `integer` | A number formatted for the locale | `formatterParams`, `prefix`, `suffix`, `min`, `max`, `step` |
| `date`, `datetime`, `time` | A date, date and time, or time | |
| `boolean` | A checkbox | `label` |
| `title` | A heading row without value | `title`, `css_title` |
| `key` | The layer name; toggles the layer | `hideLayer` |
| `pin` | A marker at the location | `display`, `style`, `zIndex`, `srid`, `label` |
| `geometry` | A geometry from a field, shown on the map | `display`, `style`, `srid`, `label`; see [editing](editing.md) |
| `link` | A link opening a new window | `url`, `label`, `icon_name` |
| `pills` | An array value as pills | `pills` |
| `json` | A JSON editor | |
| `tab` | A tab in a tabview | `target`, `label`, `dynamic`, `disabled`, `disableTabClose`, `hideTabClose` |
| `dataview` | A table or chart from a query | `target`, `query`, `display`, `tab_style` and the tab keys; see dataviews |
| `layer` | A layer derived from the location | `layer`, `data`, `query`, `display`, `style` |
| `query_button` | A button which runs a query | `query`, `queryparams`, `label`, `alert`, `reload`, `dependents` |
| `image`, `images`, `documents` | Uploads to Cloudinary | `cloudinary_folder`, `max_size` |
| `ping` | A textarea with the responses of the ping utility, for testing | |

## Notes

- `numeric` formats with `formatterParams`, the options of
  `Number.toLocaleString`, eg. `{ "maximumFractionDigits": 1 }`.
- `layer` clones the locale layer named in `layer` and applies the entry's
  keys to it, so the location can show related features, eg. a catchment.
  Its data comes from the entry value, `data`, or its `query`. The legacy
  types `mvt_clone` and `vector_layer` are mapped to `layer` with a warning.
- `query_button` runs `query` and then reloads the `dependents` fields of the
  location; see [editing](editing.md).
- Aliases share one method: `datetime` → `date`, `html` → `textarea`,
  `integer` → `numeric`, `image`, `images`, `documents` → Cloudinary.
  `report` is a legacy alias for `link`; `defaults` is deprecated and does
  nothing.[^entries]
- `min` and `max` bound the numeric edit input and fix the bounds of the
  entry's range filter; `step` only applies to the filter, see
  [editing](editing.md) and [entry filters](../layer/filter-entries.md).
- A `tab` entry sets its own `tab_style` from the location colour; only
  `dataview` entries keep a configured one.
- Uploads need the Cloudinary environment configuration of the instance.

# Examples

Numeric, boolean, title and link entries on the retail points.

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
          { "type": "key" },
          { "type": "title", "title": "Store" },
          { "title": "ID", "field": "id", "type": "integer", "inline": true },
          { "title": "Opened", "field": "open_date", "type": "date" },
          {
            "type": "link",
            "label": "Search the web",
            "url": "https://duckduckgo.com/?q=grocery"
          }
        ]
      }
    }
  }
}
```

[^entries]: ui locations/infoj.mjs and entries/_entries.mjs
