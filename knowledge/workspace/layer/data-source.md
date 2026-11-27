---
type: Workspace Key
title: Layer data source
description: Keys that tell the XYZ API where a layer's data is, which ID and geometry to use and how queries are restricted; use for every data layer.
resource: ../../../apps/xyz/mod/query.js
tags: [workspace, layer, xyz, sql, security]
status: draft
x-xyz-keys:
  - { key: layer.dbs, type: string }
  - key: layer.table
    type: string
    required: { when: { layer.format: [wkt, geojson, cluster, vector] }, or: [layer.tables, layer.features] }
  - key: layer.tables
    type: object
    required: { when: { layer.format: mvt }, or: [layer.table] }
    description: Tables by integer zoom level; null hides the layer at those levels.
  - { key: layer.tables.*, type: string }
  - { key: layer.geom, type: string }
  - { key: layer.geoms, type: object }
  - { key: layer.geoms.*, type: string }
  - key: layer.srid
    type: [string, integer]
    pattern: "^[0-9]+$"
    minimum: 1
    required: { when: { layer.format: [wkt, geojson, cluster, vector] } }
    description: EPSG code of the geometry column. Write it as a string; mvt only accepts "3857" or no srid.
  - key: layer.qID
    type: string
    required: { when: { layer.format: [wkt, geojson, cluster, vector] } }
    description: Unique ID column of the layer table.
  - key: layer.params
    type: object
    default: {}
    open: true
    description: Request params of every layer data query; custom query templates may read further params.
  - { key: layer.params.template, type: string }
  - { key: layer.params.viewport, type: boolean }
  - key: layer.params.z
    type: boolean
    formats: [wkt, geojson, cluster, vector]
    description: Sends the current map zoom as the z param.
  - { key: layer.params.default_fields, type: array, formats: [wkt, geojson, cluster, vector, mvt] }
  - key: layer.params.layer_template
    type: string
    description: Workspace template key which the XYZ API uses as the layer for this layer's queries.
  - { key: layer.queryparams, type: object }
  - { key: layer.z_field, type: string, formats: [mvt] }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: query
    resource: ../../../apps/xyz/mod/query.js
  - id: getlayer
    resource: ../../../apps/xyz/mod/workspace/getLayer.js
  - id: decorate
    resource: ../../../apps/mapp/lib/layer/decorate.mjs
  - id: mvt
    resource: ../../../apps/xyz/mod/workspace/templates/mvt.js
  - id: vector
    resource: ../../../apps/mapp/lib/layer/format/vector.mjs
  - resource: ../../../apps/mapp/lib/layer/format/mvt.mjs
  - resource: ../../../apps/xyz/tests/mod/query.test.mjs
---
# Layer data source

These keys connect a layer to a table. The XYZ API reads them from the
workspace layer and fills the matching query params with them.[^query]

- `dbs` names the connection, a `DBS_*` environment variable. Without it the
  layer uses the locale's, then the workspace's `dbs`.[^getlayer]
- `table` is the schema-qualified table, eg. `geodata.uk_glx_open_retail_points`.
- `geom` is the geometry column and `srid` its EPSG code, best as a string
  such as `"4326"`. `qID` is the unique ID column; locations are requested by
  it.
- `params` are sent with every layer data request: `template` replaces the
  format's default query template, `viewport` restricts queries to the map
  extent, `z` sends the current zoom, and `default_fields` adds columns to the
  features. `layer_template` names a workspace template which the XYZ API
  loads as the layer for queries, instead of the layer itself.[^query]
  Other params are passed to the query template. `params.fields`
  is generated before every request from `default_fields` and the theme,
  label, hover, icon scaling and cluster label fields, so a configured value
  is overwritten.
- `queryparams` are assigned to layer queries and location entry queries. The
  locale's `queryparams` are merged in; layer values win.[^getlayer]

## Zoom ranges

`tables` replaces `table` with a table per integer zoom level, and `geoms`
replaces `geom` with a geometry column per zoom level. Below the smallest or
above the largest key, the value of that key applies. A `null` table hides the
layer at those zoom levels and shows it again when a table applies.[^decorate]

```json
"tables": { "7": null, "8": "schema.table_low", "11": "schema.table_high", "14": null }
```

`z_field`, on MVT layers, names an integer column; a feature is only in a tile
when its value is lower than the tile's zoom.[^mvt]

## Constraints

- A request's `table` param must be a table named in the layer: any `table`
  value or `tables` entry anywhere in the layer, including location entries.
  Other tables are rejected with 403.[^query]
- Vector formats need `srid` and `qID`, and `table`, `tables` or inline
  [`features`](features.md); without a table for the current zoom no data is
  requested.[^vector] MVT needs `table` or `tables`, and `srid` must be absent
  or the string `"3857"`. See [layer formats](formats.md).
- A `viewport` query fails with 400 without `geom` and `srid`, or when
  `srid` is not an integer or a string of digits.[^query]

# Examples

The retail points are hidden below zoom 6 and loaded from the same table from
zoom 6.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "retail_points": {
        "display": true,
        "format": "wkt",
        "tables": { "5": null, "6": "geodata.uk_glx_open_retail_points" },
        "geom": "geom_p_4326",
        "srid": "4326",
        "qID": "id",
        "params": { "default_fields": ["retailer"] }
      }
    }
  }
}
```

[^query]: query.js layerQuery and templateTables
[^getlayer]: getLayer.js
[^decorate]: decorate.mjs tableCurrent, geomCurrent and changeEnd
[^mvt]: templates/mvt.js
[^vector]: layer/format/vector.mjs reload
