---
type: Workspace Key
title: Layer formats
description: layer.format selects how the MAPP library loads and renders a layer, and each format's required keys; use when choosing a format.
resource: ../../../apps/mapp/lib/layer/format/_format.mjs
tags: [workspace, layer, mapp, format]
status: draft
x-xyz-keys:
  - key: layer.format
    type: string
  - { key: layer.fade, type: boolean, formats: [wkt, geojson, cluster, vector] }
  - { key: layer.vectorImage, type: boolean, formats: [wkt, geojson, cluster, vector] }
  - { key: layer.featureFormat, type: string, formats: [wkt, geojson, cluster, vector] }
  - { key: layer.wkt_properties, type: boolean, formats: [mvt] }
  - { key: layer.cacheSize, type: integer, formats: [mvt] }
  - { key: layer.transition, type: integer, formats: [mvt] }
  - { key: layer.mvt_cache, type: string, formats: [mvt] }
  - { key: layer.URI, type: string, formats: [tiles] }
  - { key: layer.source, type: string, default: OSM, formats: [tiles] }
  - { key: layer.projection, type: string, default: "EPSG:3857", formats: [tiles] }
  - { key: layer.accessToken, type: string, formats: [maplibre, mapboxStyle] }
  - { key: layer.preserveDrawingBuffer, type: boolean, formats: [maplibre] }
  - { key: layer.apiKey, type: string, formats: [googleMapTiles] }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: formats
    resource: ../../../apps/mapp/lib/layer/format/_format.mjs
  - id: vector
    resource: ../../../apps/mapp/lib/layer/format/vector.mjs
  - id: mvt
    resource: ../../../apps/mapp/lib/layer/format/mvt.mjs
  - id: tiles
    resource: ../../../apps/mapp/lib/layer/format/tiles.mjs
  - resource: ../../../apps/mapp/lib/layer/format/maplibre.mjs
  - resource: ../../../apps/mapp/lib/layer/format/mapboxStyle.mjs
  - resource: ../../../apps/mapp/lib/layer/format/googleMapTiles.mjs
  - resource: ../../../packages/testhost/README.md
---
# Layer formats

`format` picks the format method which creates the Openlayers layer. A layer
with an unknown format is skipped with a warning.[^formats]

| `format` | Data | Requires |
| --- | --- | --- |
| `wkt`, `geojson`, `vector` | Features from the XYZ API, WKT or GeoJSON geometry | `srid`, `qID`, [data source](data-source.md) |
| `cluster` | As above, clustered | as above, plus [`cluster`](cluster.md) |
| `mvt` | Vector tiles from the XYZ API | `srid` 3857 (the default), [data source](data-source.md) |
| `tiles` | Raster tiles | `URI` |
| `maplibre`, `mapboxStyle` | A Mapbox GL style | `style.URL`; `accessToken` for Mapbox hosted styles |
| `googleMapTiles` | Google map tiles | `apiKey`; `style.mapType` defaults to `roadmap` |

## Vector formats

`wkt`, `geojson`, `cluster` and `vector` share one format method. Without
`srid` or `qID` the layer is skipped with a warning.[^vector] The query
template defaults to the format name; `params.template` replaces it.
There is no `vector` query template, so a `vector` layer needs
`params.template`. `featureFormat` defaults to `format` and selects how the
response is parsed.
`fade` fades the layer while new data loads. `vectorImage` renders with an
Openlayers VectorImage layer.

## MVT

MVT layers request tiles through the XYZ API. The SRID must be 3857; another
value skips the layer.[^mvt] `params.viewport` is removed, because the tile
defines the extent. `mvt_cache` is ignored with a warning: tile caching is
disabled. `wkt_properties` loads feature properties separately from the tile
geometries, so filters and themes update without reloading tiles.

## Tiles

`tiles` creates a raster tile layer from an Openlayers source, `OSM` by
default, with `URI` as the tile URL template and `params` appended as query
string. `URI` is required for every source, including `OSM`. `projection` defaults to `EPSG:3857`.[^tiles]

## Pitfalls

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
[^vector]: layer/format/vector.mjs
[^mvt]: layer/format/mvt.mjs
[^tiles]: layer/format/tiles.mjs
