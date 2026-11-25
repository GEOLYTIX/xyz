---
type: Workspace Key
title: Layer data source
description: Keys that tell the XYZ API where a layer's data is, which ID and geometry to use and how queries are restricted; use for every data layer.
resource: ../../../apps/xyz/mod/query.js
tags: [workspace, layer, xyz, sql, security]
status: draft
x-xyz-keys:
  - { key: layer.dbs, type: string }
  - { key: layer.table, type: string }
  - { key: layer.tables, type: object }
  - { key: layer.tables.*, type: string }
  - { key: layer.geom, type: string }
  - { key: layer.geoms, type: object }
  - { key: layer.geoms.*, type: string }
  - { key: layer.srid, type: [string, integer] }
  - { key: layer.qID, type: string }
  - { key: layer.params, type: object, default: {} }
  - { key: layer.params.template, type: string }
  - { key: layer.params.viewport, type: boolean }
  - { key: layer.params.default_fields, type: array, formats: [wkt, geojson, cluster, vector, mvt] }
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
  - resource: ../../../apps/xyz/tests/mod/query.test.mjs
---
# Layer data source

These keys connect a layer to a table. The XYZ API reads them from the
workspace layer and fills the matching query params with them.[^query]

- `dbs` names the connection, a `DBS_*` environment variable. Without it the
  layer uses the locale's, then the workspace's `dbs`.[^getlayer]
- `table` is the schema-qualified table, eg. `geodata.uk_glx_open_retail_points`.
- `geom` is the geometry column and `srid` its EPSG code. `qID` is the unique
  ID column; locations are requested by it.
- `params` are sent with every layer data request: `template` replaces the
  format's default query template, `viewport` restricts queries to the map
  extent, and `default_fields` adds columns to the features. `params.fields`
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
- `viewport` requires `geom` and `srid`.
- Vector formats need `srid` and `qID`; MVT requires `srid` 3857. See
  [layer formats](formats.md).

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
