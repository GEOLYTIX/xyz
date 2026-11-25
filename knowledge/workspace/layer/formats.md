---
type: Workspace Key
title: Layer formats
description: layer.format selects how the MAPP library loads and renders a layer, and each format's required keys; vector and MVT format keys. Use when choosing a format.
resource: ../../../apps/mapp/lib/layer/format/_format.mjs
tags: [workspace, layer, mapp, format]
status: draft
x-xyz-keys:
  - key: layer.format
    type: string
    examples: [cluster, geojson, googleMapTiles, mapboxStyle, maplibre, mvt, tiles, vector, wkt]
    description: Selects the method of mapp.layer.formats which creates the OpenLayers layer. Plugins add values to the registry; see plugin-extensions.md.
  - { key: layer.fade, type: boolean, formats: [wkt, geojson, cluster, vector] }
  - { key: layer.vectorImage, type: boolean, formats: [wkt, geojson, cluster, vector] }
  - key: layer.featureFormat
    type: string
    examples: [cluster, geojson, wkt, wkth3]
    formats: [wkt, geojson, cluster, vector]
    description: The mapp.layer.featureFormats method which parses the response or inline features; defaults to format. Plugins add values to the registry; see plugin-extensions.md.
  - { key: layer.wkt_properties, type: boolean, formats: [mvt] }
  - key: layer.cacheSize
    type: integer
    minimum: 0
    default: 0
    formats: [mvt]
    description: Number of tiles the MVT render source caches; 0 disables the cache.
  - key: layer.transition
    type: integer
    minimum: 0
    formats: [mvt]
    description: Tile fade-in duration in milliseconds.
  - { key: layer.mvt_cache, type: string, formats: [mvt], description: Ignored with a warning; MVT tile caching is disabled. }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: formats
    resource: ../../../apps/mapp/lib/layer/format/_format.mjs
  - id: vector
    resource: ../../../apps/mapp/lib/layer/format/vector.mjs
  - id: mvt
    resource: ../../../apps/mapp/lib/layer/format/mvt.mjs
  - id: mvt-template
    resource: ../../../apps/xyz/mod/workspace/templates/mvt.js
  - resource: ../../../packages/testhost/README.md
  - resource: ../../../apps/mapp/lib/layer/featureFormats.mjs
  - resource: ../../../apps/mapp/tests/layer/featureFormats.test.mjs
  - resource: ../../../apps/mapp/tests/layer/format/mvt.test.mjs
  - resource: ../../../apps/mapp/tests/layer/format/vector.test.mjs
---
# Layer formats

`format` picks the format method which creates the Openlayers layer. A layer
with an unknown format is skipped with a warning.[^formats]

| `format` | Data | Requires |
| --- | --- | --- |
| `wkt`, `geojson`, `vector` | Features from the XYZ API, WKT or GeoJSON geometry | `srid`, `qID`, and a [data source](data-source.md) or inline [`features`](features.md) |
| `cluster` | As above, clustered | as above, plus [`cluster`](cluster.md) |
| `mvt` | Vector tiles from the XYZ API | `table` or `tables`, `geom`; `srid` omitted or `"3857"` |
| `tiles`, `maplibre`, `mapboxStyle`, `googleMapTiles` | Raster tiles and styled basemaps | see [tile and style formats](tile-formats.md) |

## Vector formats

`wkt`, `geojson`, `cluster` and `vector` share one format method. Without
`srid` or `qID` the layer is skipped with a warning.[^vector] Without a
table for the current zoom and without inline `features` the layer requests
nothing. The query template defaults to the format name; `params.template`
replaces it. There is no `vector` query template, so a `vector` layer needs
`params.template`. The core `wkt`, `geojson` and `cluster` templates select
`geom`, so they fail without it. `featureFormat` defaults to `format` and
selects how the response is parsed.
`fade` fades the layer while new data loads. `vectorImage` renders with an
Openlayers VectorImage layer.

## MVT

MVT layers request tiles through the XYZ API. A missing `srid` defaults to
the string `"3857"`; any other value, including the number `3857`, skips the
layer with a warning.[^mvt] Without a table for the current zoom no tile is
requested, and the core `mvt` template selects `geom`.[^mvt-template]
`params.viewport` is removed, because the tile defines the extent.
`cacheSize` defaults to 0, no tile cache; `transition` is the tile fade-in in
milliseconds. `mvt_cache` is ignored with a warning: tile caching is
disabled. `wkt_properties` loads feature properties separately from the tile
geometries, so filters and themes update without reloading tiles.

## Pitfalls

- `"srid": 3857` as a number skips an MVT layer: the check compares with the
  string `"3857"`. Vector formats accept a number, but cluster's `4326` check
  also compares strings, so write SRIDs as strings.
- The Wiki describes `mvt_cache` tile caching; the code disables it.
- The devdb cannot create vector tiles. The testhost replaces the `mvt`
  template, so MVT examples test the MAPP format, not the core SQL.

# Examples

A WKT point layer and a GeoJSON polygon layer, both from the devdb.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "points": {
        "display": true,
        "format": "wkt",
        "table": "example.locations",
        "geom": "geom",
        "srid": "4326",
        "qID": "id"
      },
      "polygons": {
        "display": true,
        "format": "geojson",
        "table": "example.features",
        "geom": "geom",
        "srid": "3857",
        "qID": "id",
        "fade": true
      }
    }
  }
}
```

[^formats]: layer/format/_format.mjs and layer/decorate.mjs
[^vector]: layer/format/vector.mjs vector and reload
[^mvt]: layer/format/mvt.mjs
[^mvt-template]: templates/mvt.js
