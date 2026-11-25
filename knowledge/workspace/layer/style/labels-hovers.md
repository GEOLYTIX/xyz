---
type: Workspace Key
title: Labels and hovers
description: layer.style.label(s) draw feature properties as map text, and layer.style.hover(s) show an infotip under the pointer; use to annotate features.
resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
tags: [workspace, layer, style, label, hover, mapp]
status: draft
x-xyz-keys:
  - { key: layer.style.label, type: [object, string] }
  - { key: layer.style.labels, type: object }
  - { key: layer.style.labels.*, type: object }
  - { key: layer.style.label.field, type: string }
  - { key: layer.style.label.title, type: string }
  - { key: layer.style.label.display, type: boolean }
  - { key: layer.style.label.count, type: boolean, requires: [layer.cluster] }
  - { key: layer.style.label.font, type: string, default: 12px sans-serif }
  - { key: layer.style.label.fillColor, type: string, default: "#000" }
  - { key: layer.style.label.strokeColor, type: string }
  - { key: layer.style.label.strokeWidth, type: number, default: 1, minimum: 0 }
  - { key: layer.style.label.minZoom, type: number }
  - { key: layer.style.label.maxZoom, type: number }
  - { key: layer.style.label.offsetX, type: number }
  - { key: layer.style.label.offsetY, type: number }
  - { key: layer.style.label.overflow, type: boolean }
  - { key: layer.style.label.hidden, type: boolean, description: Do not show the label controls in the style panel. }
  - { key: layer.style.hover, type: [object, string] }
  - { key: layer.style.hovers, type: object }
  - { key: layer.style.hovers.*, type: object }
  - { key: layer.style.hover.field, type: string }
  - { key: layer.style.hover.title, type: string }
  - { key: layer.style.hover.display, type: boolean }
  - { key: layer.style.hover.query, type: string, default: infotip }
  - { key: layer.style.hover.dynamic, type: boolean }
  - { key: layer.style.hover.hidden, type: boolean, description: Do not show the hover controls in the style panel. }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: featurestyle
    resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: olstyle
    resource: ../../../../apps/mapp/lib/utils/olStyle.mjs
  - id: hover
    resource: ../../../../apps/mapp/lib/layer/featureHover.mjs
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: layerstyle
    resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
  - resource: ../../../../apps/mapp/tests/layer/featureStyle.test.mjs
  - resource: ../../../../apps/ui/tests/elements/layerStyle.test.mjs
---
# Labels and hovers

## Labels

`style.label` draws the value of `label.field` next to each feature, while
`label.display` is true. The ui offers a toggle titled `label.title`. On a
cluster layer, `count` shows the number of locations on cluster features
instead. Without the field the feature's `label` property is drawn; the text
is always taken from the feature, never from the
configuration.[^featurestyle] `minZoom` and `maxZoom` limit the zoom range.

The text is styled with `font` (`12px sans-serif`), `fillColor` (`#000`), a
halo of `strokeColor` and `strokeWidth`, `offsetX`/`offsetY` in pixels, and
`overflow` to draw labels which exceed their polygon.[^olstyle]

## Hovers

`style.hover` shows an infotip for the feature under the pointer while
`hover.display` is true.[^hover]

- If the feature already has the `hover.field` property, it is shown directly.
- Otherwise the MAPP library queries the `hover.query` template, `infotip` by
  default, with `field`, the feature `id`, the layer table and the layer
  `queryparams`, and shows the returned `label`. Responses are cached unless
  `hover.dynamic` is set.

`label.hidden` and `hover.hidden` remove their toggles and dropdowns from the
style panel, and hide an entry of `labels` or `hovers` from the
dropdown.[^layerstyle]

## Several labels or hovers

`style.labels` and `style.hovers` are maps of named configurations; the key is
the default `title`. `style.label` or `style.hover` may name one of them, or
the first is used.[^parser] A theme's `setLabel` and `setHover` switch them
with the theme; see [themes](themes.md).

Label, hover, theme and icon scaling fields are added to the layer query's
fields automatically; see [layer data source](../data-source.md).

## Pitfalls

- A label or hover without `display: true` is configured but not shown.
- A hover `field` must be a column of the current table, or a template the
  `infotip` query can use.

# Examples

Retail point labels from zoom 12 and an infotip with the store name.

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
        "style": {
          "default": { "icon": { "type": "dot", "fillColor": "#e66" } },
          "label": {
            "title": "Store names",
            "field": "store_name",
            "display": true,
            "minZoom": 12,
            "strokeColor": "#fff",
            "strokeWidth": 3
          },
          "hover": { "field": "store_name", "display": true }
        }
      }
    }
  }
}
```

[^featurestyle]: featureStyle.mjs labelStyle
[^olstyle]: utils/olStyle.mjs
[^hover]: featureHover.mjs
[^parser]: styleParser.mjs handleHovers
[^layerstyle]: ui/elements/layerStyle.mjs label() and hover()
