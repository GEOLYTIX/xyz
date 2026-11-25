---
type: Workspace Key
title: Locale view
description: Keys for the mapview a locale creates - start view, extent, zoom range, projection, controls, SVG templates and location records; use for every locale.
resource: ../../../apps/mapp/lib/mapview/_mapview.mjs
tags: [workspace, locale, mapview, mapp]
status: draft
x-xyz-keys:
  - { key: locale.view, type: object }
  - { key: locale.view.lat, type: number, default: 0 }
  - { key: locale.view.lng, type: number, default: 0 }
  - { key: locale.view.z, type: number }
  - { key: locale.extent, type: object }
  - { key: locale.extent.north, type: number, default: 90 }
  - { key: locale.extent.south, type: number, default: -90 }
  - { key: locale.extent.east, type: number, default: 180 }
  - { key: locale.extent.west, type: number, default: -180 }
  - { key: locale.extent.mask, type: boolean }
  - { key: locale.minZoom, type: integer, default: 0 }
  - { key: locale.maxZoom, type: integer }
  - { key: locale.srid, type: string, default: "3857" }
  - { key: locale.ScaleLine, type: string }
  - { key: locale.mapviewControls, type: array }
  - { key: locale.svgTemplates, type: object }
  - { key: locale.svg_templates, type: object }
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
---
# Locale view

The MAPP library creates the mapview from the locale.[^mapview]

- `view` is the start view: `lat`, `lng` and zoom `z`. URL hooks override it.
  Without `z` the map starts at `minZoom`.
- `extent` limits panning to `north`, `south`, `east` and `west` in degrees.
  An invalid extent falls back to the world with a warning. `mask` greys out
  everything outside the extent.
- `minZoom` and `maxZoom` limit zooming.
- `srid` is the mapview projection, `3857` by default.
- `ScaleLine` adds a scale bar in `metric` or `imperial` units.
  `mapviewControls` adds Openlayers controls by name, eg. `["Zoom"]`.
- `svgTemplates` maps names to SVG URLs which are loaded before layers render,
  for icons with `type: template`. `svg_templates` is the legacy name.
- `listview_records` sets the symbols and colours of the location list, eg.
  `[{ "symbol": "1", "colour": "#000" }]`; the default is A to J.[^listview]

## Pitfalls

- `bounds`, `maskBounds`, `showScaleBar` and `scalebar` are legacy keys,
  renamed or converted with a warning.
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
