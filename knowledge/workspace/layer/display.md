---
type: Workspace Key
title: Layer display and view
description: Keys that name a layer, decide whether it is shown and how its view appears in the layers list; use for every layer.
resource: ../../../apps/mapp/lib/layer/decorate.mjs
tags: [workspace, layer, mapp, ui]
status: draft
x-xyz-keys:
  - { key: layer, type: object }
  - { key: layer.name, type: string }
  - { key: layer.display, type: boolean }
  - { key: layer.hidden, type: boolean }
  - { key: layer.meta, type: string }
  - { key: layer.group, type: string }
  - { key: layer.groupmeta, type: string }
  - { key: layer.zIndex, type: integer }
  - { key: layer.promoteDisplay, type: boolean }
  - { key: layer.attribution, type: object }
  - { key: layer.attribution.*, type: string }
  - { key: layer.viewConfig, type: object }
  - { key: layer.viewConfig.displayToggle, type: boolean, default: true }
  - { key: layer.viewConfig.zoomBtn, type: boolean, default: true, requires: [layer.tables] }
  - { key: layer.viewConfig.hideDisabled, type: boolean, default: false, requires: [layer.tables] }
  - { key: layer.viewConfig.zoomToFilteredExtentBtn, type: boolean, default: true }
  - { key: layer.viewConfig.popoutBtn, type: boolean }
  - { key: layer.viewConfig.panelOrder, type: array }
  - { key: layer.viewConfig.keyOrder, type: array }
  - { key: layer.viewConfig.headerOrder, type: array, default: [zoomToFilteredExtentBtn, zoomBtn, popoutBtn, displayToggle] }
  - { key: layer.viewConfig.classList, type: string }
  - { key: layer.panelOrder, type: array }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: decorate
    resource: ../../../apps/mapp/lib/layer/decorate.mjs
  - resource: ../../../apps/mapp/lib/layer/_layer.mjs
  - resource: ../../../apps/ui/lib/layers/view.mjs
  - resource: ../../../apps/xyz/mod/workspace/getLayer.js
---
# Layer display and view

A layer is a JSON object in `locale.layers`, keyed by its layer key. The XYZ
API assigns the key as `layer.key` and, without a `name`, as the name. The
MAPP library decorates the layer when it is added to a mapview.[^decorate]

- `display` shows the layer when the mapview is created. In a mapview with
  URL hooks, a `layers` URL parameter decides instead.
- `hidden` creates no layer view in the layers list. The layer is still in
  `mapview.layers` and can be shown programmatically.
- `name` is the header of the layer view. `meta` is HTML shown in the view.
- `group` puts layer views with the same value into one group drawer;
  `groupmeta` is HTML shown in the group.
- `attribution` maps source names to URLs, shown in the map attribution
  while the layer is displayed.
- `zIndex` orders the layer canvas. Without one, layers get increasing values
  in locale order, so later layers draw on top. `promoteDisplay` draws the
  layer above all displayed layers whenever it is shown.

## Layer view

`viewConfig` controls the layer view in the layers list:[^view]

- `displayToggle`, `zoomToFilteredExtentBtn` and `popoutBtn` add header
  buttons; `headerOrder` orders them.
- `zoomBtn` and `hideDisabled` only apply to layers with `tables`, which have a
  zoom range: a zoom button, and hiding the view outside the range.
- `panelOrder` sorts the view drawers by their data-id, eg. `filter-drawer`.
  `keyOrder` orders the layer keys whose panel methods create the drawers.
- `classList` is added to the view drawer element.

`panelOrder`, `zoomBtn`, `popout` and `drawer` directly on the layer are legacy
forms which the ui copies into `viewConfig`.

Any layer key which matches a `mapp.layer` method or a `mapp.plugins` method
calls that method with the decorated layer, so a plugin is configured by
adding its key to the layer.[^decorate]

## Pitfalls

- A layer whose `format` is not a registered format is skipped with a
  console warning; see [layer formats](formats.md).
- A plugin key with a typo is ignored silently.

# Examples

Two layers in one group; the second is not displayed when the map opens.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "locations": {
        "name": "Capitals",
        "group": "Examples",
        "display": true,
        "format": "wkt",
        "table": "example.locations",
        "geom": "geom",
        "srid": "4326",
        "qID": "id"
      },
      "features": {
        "name": "Features",
        "group": "Examples",
        "meta": "Polygons and lines in EPSG:3857.",
        "display": false,
        "format": "wkt",
        "table": "example.features",
        "geom": "geom",
        "srid": "3857",
        "qID": "id"
      }
    }
  }
}
```

[^decorate]: decorate.mjs
[^view]: ui layers/view.mjs viewConfig
