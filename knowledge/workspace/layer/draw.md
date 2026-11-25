---
type: Workspace Key
title: Layer drawing
description: layer.draw adds buttons which draw a geometry and create a new location in the layer table; use to let users add locations.
resource: ../../../apps/ui/lib/layers/panels/draw.mjs
tags: [workspace, layer, draw, location, ui]
status: draft
x-xyz-keys:
  - { key: layer.draw, type: object, requires: [layer.geom] }
  - { key: layer.draw.point, type: [boolean, object] }
  - { key: layer.draw.line, type: [boolean, object] }
  - { key: layer.draw.polygon, type: [boolean, object] }
  - { key: layer.draw.rectangle, type: [boolean, object] }
  - { key: layer.draw.circle_2pt, type: [boolean, object] }
  - { key: layer.draw.circle, type: [boolean, object] }
  - { key: layer.draw.locator, type: [boolean, object] }
  - { key: layer.draw.hidden, type: boolean }
  - { key: layer.draw.drawer, type: boolean }
  - { key: layer.draw.popout, type: boolean }
  - { key: layer.draw.dialog, type: [boolean, object] }
  - { key: layer.draw.classList, type: string }
  - { key: layer.draw.point.label, type: string }
  - { key: layer.draw.line.label, type: string }
  - { key: layer.draw.polygon.label, type: string }
  - { key: layer.draw.rectangle.label, type: string }
  - { key: layer.draw.circle_2pt.label, type: string }
  - { key: layer.draw.circle.label, type: string }
  - { key: layer.draw.locator.label, type: string }
  - { key: entry.draw, type: object }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: panel
    resource: ../../../apps/ui/lib/layers/panels/draw.mjs
  - id: drawing
    resource: ../../../apps/ui/lib/elements/drawing.mjs
  - id: create
    resource: ../../../apps/mapp/lib/location/create.mjs
  - resource: ../../../apps/ui/lib/locations/entries/geometry.mjs
  - resource: ../../../apps/xyz/mod/workspace/templates/location_new.js
  - resource: ../../../apps/mapp/lib/mapview/interactions/draw.mjs
  - resource: ../../../apps/mapp/tests/mapview/interactions/draw.test.mjs
---
# Layer drawing

`layer.draw` adds a "new location" drawer to the layer view with a button for
each drawing key.[^panel] Drawing a geometry creates a new record in the layer
table through the `location_new` query, stores the geometry in `layer.geom`,
and opens the new location.[^create]

| Key | Draws |
| --- | --- |
| `point`, `line`, `polygon` | A point, a line or a polygon |
| `rectangle` | A rectangle from two corners |
| `circle_2pt` | A circle from its centre and a point on its edge |
| `circle` | A circle with a radius entered in the drawer, with units |
| `locator` | A point at the user's current position |

A key set to `true` uses the defaults; an object configures the drawing
interaction; its `label` is the button text. Keys which are not drawing
methods are ignored.[^drawing]

- `hidden` creates no drawer; `drawer: false` shows the buttons without a
  drawer; `dialog` shows them in a dialog; `popout` and `classList` change
  the drawer.
- A geometry infoj entry has its own `draw` configuration for the geometry it
  edits; see [location editing](../location/editing.md).
- New records get the default values of infoj entries with `default`; see
  [location infoj](../location/infoj.md).

## Pitfalls

- A layer without `geom` gets no drawer, with a console warning.
- `layer.draw.delete` is a legacy form of `layer.deleteLocation`.
- Restrict layers with drawing to the users who add locations with layer
  [roles](../roles.md).

# Examples

Point and current-position drawing on the retail points.

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
        "draw": { "point": true, "locator": true }
      }
    }
  }
}
```

[^panel]: ui layers/panels/draw.mjs
[^drawing]: ui elements/drawing.mjs
[^create]: mapp location/create.mjs
