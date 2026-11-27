---
type: Workspace Key
title: Layer tile and style formats
description: Keys of the tiles, maplibre, mapboxStyle and googleMapTiles formats, which render raster tiles and styled basemaps; use when adding a basemap.
resource: ../../../apps/mapp/lib/layer/format/tiles.mjs
tags: [workspace, layer, mapp, format, basemap]
status: draft
x-xyz-keys:
  - key: layer.URI
    type: string
    formats: [tiles]
    required: { when: { layer.format: tiles } }
    description: Tile URL template, eg. with {z}/{x}/{y}; layer.params are appended as query string.
  - { key: layer.source, type: string, default: OSM, formats: [tiles], description: Name of the Openlayers tile source class, eg. OSM or XYZ. }
  - { key: layer.projection, type: string, default: "EPSG:3857", formats: [tiles] }
  - { key: layer.style.contextFilter, type: string, formats: [tiles], description: CSS filter applied to the tile canvas, eg. grayscale(100%). }
  - key: layer.accessToken
    type: string
    formats: [maplibre, mapboxStyle]
    description: Mapbox access token; maplibre only fetches style.URL when it is set.
  - { key: layer.preserveDrawingBuffer, type: boolean, formats: [maplibre], description: Keeps the maplibre canvas readable, eg. for map screenshots. }
  - key: layer.style.URL
    type: string
    formats: [maplibre, mapboxStyle]
    description: Mapbox GL style URL. maplibre only fetches it with layer.accessToken; otherwise it needs layer.style.object.
  - key: layer.style.object
    type: object
    open: true
    formats: [maplibre]
    description: An inline Mapbox GL style document, used by maplibre when style.URL is not fetched.
  - key: layer.apiKey
    type: string
    formats: [googleMapTiles]
    required: { when: { layer.format: googleMapTiles } }
    description: Google Map Tiles API key.
  - { key: layer.style.mapType, type: string, default: roadmap, formats: [googleMapTiles] }
  - { key: layer.style.layerTypes, type: array, formats: [googleMapTiles] }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: tiles
    resource: ../../../apps/mapp/lib/layer/format/tiles.mjs
  - id: maplibre
    resource: ../../../apps/mapp/lib/layer/format/maplibre.mjs
  - id: mapboxStyle
    resource: ../../../apps/mapp/lib/layer/format/mapboxStyle.mjs
  - id: google
    resource: ../../../apps/mapp/lib/layer/format/googleMapTiles.mjs
  - resource: ../../../apps/mapp/tests/layer/format/tiles.test.mjs
---
# Layer tile and style formats

These formats render tiles which the XYZ API does not query. See
[layer formats](formats.md) for choosing a format.

| `format` | Requires |
| --- | --- |
| `tiles` | `URI` |
| `maplibre` | `style.URL` with `accessToken`, or an inline `style.object` |
| `mapboxStyle` | `style.URL`; `accessToken` for Mapbox hosted styles |
| `googleMapTiles` | `apiKey` |

## Tiles

`tiles` creates a raster tile layer from an Openlayers source, `OSM` by
default, with `URI` as the tile URL template and `params` appended as query
string. `URI` is required for every source, including `OSM`: the URL is
`URI` plus the params, so a missing `URI` requests `undefined…`.
`style.contextFilter` applies a CSS filter such as `grayscale(100%)` to the
tile canvas. `projection` defaults to `EPSG:3857`.[^tiles]

## Mapbox GL styles

`maplibre` renders a maplibre-gl map in a container in the map element. It
fetches `style.URL` only when `accessToken` is set, and rewrites `mapbox:`
URLs with the token. Without a token it needs the style document inline in
`style.object`; with neither the layer is skipped with a
warning.[^maplibre] `preserveDrawingBuffer` keeps the canvas readable for
screenshots.

`mapboxStyle` passes `style.URL` and `accessToken` to ol-mapbox-style.[^mapboxStyle]

## Google map tiles

`googleMapTiles` creates an Openlayers Google source with `apiKey`.
`style.mapType` defaults to `roadmap`; `style.layerTypes` adds overlays such
as `layerRoadmap`.[^google]

## Pitfalls

- A `maplibre` layer with `style.URL` but no `accessToken` is skipped: the
  URL is never fetched.
- `layer.style` of these formats holds no feature styles; see
  [layer style](style/index.md) for vector layers.

# Examples

A greyscale OpenStreetMap basemap below a devdb point layer.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "OSM": {
        "display": true,
        "format": "tiles",
        "URI": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        "style": { "contextFilter": "grayscale(100%)" }
      },
      "points": {
        "display": true,
        "format": "wkt",
        "table": "example.locations",
        "geom": "geom",
        "srid": "4326",
        "qID": "id"
      }
    }
  }
}
```

[^tiles]: layer/format/tiles.mjs
[^maplibre]: layer/format/maplibre.mjs
[^mapboxStyle]: layer/format/mapboxStyle.mjs
[^google]: layer/format/googleMapTiles.mjs
