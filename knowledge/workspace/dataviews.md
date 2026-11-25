---
type: Workspace Key
title: Dataviews
description: Dataviews show query results as JSON, tables or charts for a layer or a location, refreshed with the map or filter; use to add tables and charts.
resource: ../../apps/ui/lib/Dataview.mjs
tags: [workspace, dataview, table, chart, ui]
status: draft
x-xyz-keys:
  - { key: layer.dataviews, type: object }
  - { key: layer.dataviews.*, type: object, ref: dataview }
  - { key: dataview.dataview, type: string }
  - { key: dataview.title, type: string }
  - { key: dataview.label, type: string }
  - { key: dataview.target, type: string }
  - { key: dataview.display, type: boolean }
  - { key: dataview.query, type: string }
  - { key: dataview.queryparams, type: object }
  - { key: dataview.queryparams.*, type: [string, number, boolean, object, array] }
  - { key: dataview.queryparams.table, type: [boolean, string] }
  - { key: dataview.queryparams.filter, type: [boolean, object] }
  - { key: dataview.queryparams.viewport, type: [boolean, string] }
  - { key: dataview.queryparams.z, type: [boolean, number] }
  - { key: dataview.queryparams.id, type: [boolean, string, integer] }
  - { key: dataview.queryparams.qID, type: [boolean, string] }
  - { key: dataview.queryparams.center, type: [boolean, string] }
  - { key: dataview.queryparams.geom, type: [boolean, string] }
  - { key: dataview.viewport, type: boolean }
  - { key: dataview.mapChange, type: boolean }
  - { key: dataview.dynamic, type: boolean }
  - { key: dataview.reload, type: boolean }
  - { key: dataview.data, type: [object, array] }
  - { key: dataview.props, type: object }
  - { key: dataview.toolbar, type: object }
  - { key: dataview.table, type: object }
  - { key: dataview.chart, type: object }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: dataview
    resource: ../../apps/ui/lib/Dataview.mjs
  - id: params
    resource: ../../apps/mapp/lib/utils/queryParams.mjs
  - id: panel
    resource: ../../apps/ui/lib/layers/panels/dataviews.mjs
  - id: entry
    resource: ../../apps/ui/lib/locations/entries/dataview.mjs
  - resource: ../../apps/ui/lib/utils/dataview.mjs
  - resource: ../../apps/ui/lib/utils/jsonDataview.mjs
  - resource: ../../apps/ui/tests/Dataview.test.mjs
  - id: plugins
    resource: https://github.com/GEOLYTIX/xyz_plugins
---
# Dataviews

A dataview runs a query template and renders the response. Dataviews are
configured in two places:

- `layer.dataviews` maps keys to dataviews; the layer view lists them with
  checkboxes in a drawer.[^panel]
- An infoj entry with `type: dataview` is a dataview for the location; its
  `target` defaults to the location view.[^entry]

## Type and target

`dataview` names the renderer in `mapp.ui.utils`. The core has `Json`, a JSON
viewer whose editor options are `props`. A `table` object selects
`tabulator` and a `chart` object selects `chartjs`; both are provided by the
[tabulator and chartjs plugins](https://github.com/GEOLYTIX/xyz_plugins),
which the locale must load. `table` holds Tabulator options, eg. `columns`,
and `chart` a Chart.js configuration. A missing renderer logs an error.[^dataview]

`target` is the id of an element, or `tabview` for the tab bar of the default
view. `label` (defaulting to `title` or the key) adds the display checkbox;
`display` shows the dataview at once.

## Data

`data` is shown as is. Otherwise `query` names the query template, with
`queryparams`. The layer's `queryparams` are merged in, and some params
resolve when set to `true`:[^params]

| Param | Value |
| --- | --- |
| `table` | The layer table for the current zoom |
| `filter` | The layer's current filter |
| `viewport` | The map extent; also `dataview.viewport` |
| `z` | The zoom level |
| `id`, `qID` | The location ID and ID column, for location dataviews |
| `center`, `geom` | The map centre, and the layer geometry column |

`mapChange` reloads the dataview after the map moves, while it and its layer
are displayed. `reload` reloads it whenever it is shown; `dynamic` recreates
it. `toolbar` adds buttons above the dataview, eg. `update`, which edits the
query in a dialog; the plugins add `download_csv` and others.

## Pitfalls

- A table or chart without its plugin fails to render. Check that the locale
  loads the plugin.
- The query template must use `${table}`, `${filter}` and `${viewport}` for
  the matching params to apply.

# Examples

Countries with two JSON dataviews: population statistics and a count of the
countries in the current filter.

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
        "dataviews": {
          "population": {
            "title": "Population",
            "dataview": "Json",
            "query": "field_stats",
            "queryparams": { "table": true, "field": "pop_est" }
          },
          "count": {
            "title": "Countries",
            "dataview": "Json",
            "query": "location_count",
            "queryparams": { "table": true, "filter": true }
          }
        }
      }
    }
  }
}
```

[^panel]: ui layers/panels/dataviews.mjs
[^entry]: ui locations/entries/dataview.mjs
[^dataview]: ui Dataview.mjs checkDataview
[^params]: mapp utils/queryParams.mjs
