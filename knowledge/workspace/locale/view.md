---
type: Workspace Key
title: Locale view
description: Keys for the mapview a locale creates - start view, extent, zoom range, projection, controls, SVG templates and location records; use for every locale.
resource: ../../../apps/mapp/lib/mapview/_mapview.mjs
tags: [workspace, locale, mapview, mapp]
status: draft
x-xyz-keys:
  - key: locale.view
    type: object
    open: true
    description: The start view, passed to the Openlayers View; other ol.View options apply.
  - { key: locale.view.lat, type: number, default: 0, minimum: -90, maximum: 90 }
  - { key: locale.view.lng, type: number, default: 0, minimum: -180, maximum: 180 }
  - { key: locale.view.z, type: number, minimum: 0, description: Start zoom; minZoom without it. }
  - key: locale.view.minZoom
    type: number
    minimum: 0
    description: Minimum zoom of the view; takes precedence over locale.minZoom.
  - key: locale.view.maxZoom
    type: number
    minimum: 0
    description: Maximum zoom of the view; takes precedence over locale.maxZoom.
  - { key: locale.extent, type: object }
  - { key: locale.extent.north, type: number, default: 90, minimum: -90, maximum: 90 }
  - { key: locale.extent.south, type: number, default: -90, minimum: -90, maximum: 90 }
  - { key: locale.extent.east, type: number, default: 180, minimum: -180, maximum: 180 }
  - { key: locale.extent.west, type: number, default: -180, minimum: -180, maximum: 180 }
  - { key: locale.extent.mask, type: boolean, description: Grey out the map outside the extent. }
  - { key: locale.minZoom, type: integer, default: 0, minimum: 0 }
  - { key: locale.maxZoom, type: integer, minimum: 0 }
  - key: locale.srid
    type: string
    default: "3857"
    pattern: "^[1-9][0-9]*$"
    description: EPSG code of the mapview projection, digits only.
  - key: locale.ScaleLine
    type: string
    enum: [metric, imperial]
    description: Units of the scale bar; any value other than imperial shows metric.
  - { key: locale.mapviewControls, type: array }
  - key: "locale.mapviewControls[]"
    type: string
    enum: [Attribution, FullScreen, MousePosition, OverviewMap, Rotate, ScaleLine, Zoom, ZoomSlider, ZoomToExtent]
    description: An Openlayers control class created without options; unknown names are ignored.
  - { key: locale.svgTemplates, type: object }
  - { key: "locale.svgTemplates.*", type: string, description: URL or data URI of an SVG template. }
  - { key: locale.svg_templates, type: object, deprecated: locale.svgTemplates }
  - { key: locale.listview_records, type: array }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: mapview
    resource: ../../../apps/mapp/lib/mapview/_mapview.mjs
  - id: listview
    resource: ../../../apps/ui/lib/locations/listview.mjs
  - resource: ../../../apps/mapp/tests/mapview
  - resource: ../../../apps/mapp/lib/utils/svgTemplates.mjs
  - resource: ../../../apps/mapp/lib/utils/proj4.mjs
  - resource: ../../../public/views/_default.html
---
# Locale view

The MAPP library creates the mapview from the locale.[^mapview]

- `view` is the start view: `lat`, `lng` and zoom `z`. URL hooks override it.
  Without `z` the map starts at `minZoom`. The object is passed to the
  Openlayers View, so `view.minZoom` and `view.maxZoom` take precedence over
  the locale keys, and other View options such as `enableRotation` apply;
  `center`, `zoom`, `projection` and `extent` are set by the mapview.
- `extent` limits panning to `north`, `south`, `east` and `west` in degrees.
  An invalid extent falls back to the world with a warning. `mask` greys out
  everything outside the extent.
- `minZoom` and `maxZoom` limit zooming.
- `srid` is the EPSG code of the mapview projection, `3857` by default.
  Openlayers knows only 3857 and 4326; other projections must be added with
  `mapp.utils.proj4.addProjection` before the mapview is created.
- `ScaleLine` adds a scale bar in `metric` or `imperial` units; any other
  value shows metric.
- `mapviewControls` adds Openlayers controls by class name, eg. `["Zoom"]`,
  created without options from the `ol.control` of the page (Openlayers 10
  in the default view). Names not in `ol.control` are ignored.
- `svgTemplates` maps names to SVG URLs which are loaded before layers render,
  for icons with `type: template`. `svg_templates` is the deprecated name,
  still read when `svgTemplates` is not set.
- `listview_records` sets the symbols and colours of the location list, eg.
  `[{ "symbol": "1", "colour": "#000" }]`; the default is A to J.[^listview]

## Pitfalls

- `bounds`, `maskBounds`, `showScaleBar` and `scalebar` are legacy keys,
  renamed or converted with a warning.
- Latitudes and longitudes are degrees; an extent with `north` below `south`
  or `east` below `west` falls back to the world. Zooms have no upper
  limit here; without `maxZoom` Openlayers stops at zoom 28.
- The extent does not change the minimum zoom; set `minZoom` to stop users
  zooming out past the extent.

# Examples

A UK locale with a masked extent, metric scale bar and zoom range.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "view": { "lat": 51.5, "lng": -0.1, "z": 10 },
    "extent": { "north": 61, "south": 49.8, "east": 2, "west": -8.7, "mask": true },
    "minZoom": 5,
    "maxZoom": 18,
    "ScaleLine": "metric",
    "mapviewControls": ["Rotate"],
    "layers": {
      "retail_points": {
        "display": true,
        "format": "wkt",
        "table": "geodata.uk_glx_open_retail_points",
        "geom": "geom_p_4326",
        "srid": "4326",
        "qID": "id"
      }
    }
  }
}
```

[^mapview]: mapp mapview/_mapview.mjs viewConfig, viewExtent, mapviewControls, viewMask
[^listview]: ui locations/listview.mjs
