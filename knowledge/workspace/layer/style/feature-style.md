---
type: Workspace Key
title: Feature styles and icons
description: layer.style.default, highlight, selected and cluster styles, the feature style keys and point icons; use to style any vector or MVT layer.
resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
tags: [workspace, layer, style, mapp]
status: draft
x-xyz-keys:
  - { key: layer.style, type: object, default: {} }
  - { key: layer.style.default, type: object, ref: style }
  - { key: layer.style.highlight, type: object, ref: style }
  - { key: layer.style.selected, type: object, ref: style }
  - { key: layer.style.cluster, type: object, ref: style, requires: [layer.cluster] }
  - { key: layer.style.cluster.clusterScale, type: number, default: 1 }
  - { key: layer.style.zoomInScale, type: number }
  - { key: layer.style.zoomOutScale, type: number }
  - { key: layer.style.opacity, type: number, default: 1 }
  - { key: layer.style.icon_scaling, type: object }
  - { key: layer.style.icon_scaling.field, type: string }
  - { key: layer.style.icon_scaling.scaleFactor, type: number }
  - { key: layer.style.icon_scaling.max, type: number }
  - { key: layer.style.icon_scaling.cluster, type: [boolean, string] }
  - { key: layer.style.icon_scaling.icon, type: boolean }
  - { key: layer.style.icon_scaling.clusterScale, type: boolean, requires: [layer.style.cluster] }
  - { key: style.fillColor, type: string }
  - { key: style.fillOpacity, type: number }
  - { key: style.strokeColor, type: string }
  - { key: style.strokeWidth, type: number }
  - { key: style.strokeOpacity, type: number }
  - { key: style.highlightScale, type: number }
  - { key: style.scale, type: number }
  - { key: style.icon, type: [object, array] }
  - { key: style.icon.type, type: string }
  - { key: style.icon.url, type: string }
  - { key: style.icon.scale, type: number }
  - { key: style.icon.anchor, type: array }
  - { key: style.icon.fillColor, type: string }
  - { key: style.icon.layers, type: object }
  - { key: style.icon.layers.*, type: string }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: featurestyle
    resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: symbols
    resource: ../../../../apps/mapp/lib/utils/svgSymbols.mjs
  - id: layerstyle
    resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
  - resource: ../../../../apps/mapp/tests/layer/styleParser.test.mjs
  - resource: ../../../../apps/mapp/tests/layer/featureStyle.test.mjs
  - resource: ../../../../apps/ui/tests/elements/layerStyle.test.mjs
---
# Feature styles and icons

A **feature style** is an object of the `style` keys below. `layer.style`
holds the feature styles a layer uses:

- `default` applies to every feature. Without it the MAPP library warns and
  uses a white fill with a dark stroke, or a dot icon on a cluster
  layer.[^parser]
- `highlight` applies to the feature under the pointer. It is drawn on top;
  its `scale` becomes `highlightScale`.
- `selected` applies to features whose location is open.
- `cluster` applies to features which stand for several locations. It
  defaults to a dot icon with `clusterScale` 1, which grows the icon with the
  cluster size.
- `opacity` sets the opacity of the whole layer.

Themes, labels and hovers add to these; see [themes](themes.md) and
[labels and hovers](labels-hovers.md).

## Feature style keys

`fillColor`, `fillOpacity`, `strokeColor`, `strokeWidth` and `strokeOpacity`
style lines and polygons. A point needs `icon`: an object, or an array of
icons drawn on top of each other.

- `icon.type` draws a built-in SVG symbol: `dot`, `target`, `triangle`,
  `square`, `diamond`, `semiCircle`, `markerLetter`, `markerColor` or
  `circle`, coloured with `icon.fillColor`. A `target` draws rings from
  `icon.layers`, a map of radius fractions to colours.[^symbols]
- `icon.url` draws an image or SVG from a URL. The legacy `icon.svg` is
  copied to `url`.
- `icon.scale` scales the icon; `icon.anchor` positions it.

`zoomInScale` and `zoomOutScale` on `layer.style` grow or shrink icons with
the zoom level. `icon_scaling` scales icons by a numeric `field`: the scale is
`1 + value / scaleFactor`. Cluster icons are only scaled with
`icon_scaling.cluster`, summing values, or averaging them with `"avg"`.[^featurestyle]
`icon_scaling.icon` adds a style panel slider for the icon scale, and
`icon_scaling.clusterScale` one for `style.cluster.clusterScale`, shown only
when the cluster style sets it.[^layerstyle]

## Pitfalls

- A cluster layer keeps only `icon` and `scale` in `style.default`; other keys
  are removed with a warning.
- `layer.style.zIndex`, `layer.hover` and `layer.icon_scaling` are legacy;
  use `layer.zIndex`, `layer.style.hover` and `layer.style.icon_scaling`.
- A `style` object inside `style.default` is unwrapped with a warning.

# Examples

Countries as grey polygons with a yellow highlight.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "layers": {
      "countries": {
        "display": true,
        "format": "geojson",
        "table": "naturalearth.countries",
        "geom": "geom_4326",
        "srid": "4326",
        "qID": "id",
        "style": {
          "default": {
            "fillColor": "#d9d9d9",
            "fillOpacity": 0.5,
            "strokeColor": "#555",
            "strokeWidth": 1
          },
          "highlight": { "fillColor": "#dbd56e", "fillOpacity": 0.7 }
        }
      }
    }
  }
}
```

[^parser]: styleParser.mjs warnings and clusterChecks
[^featurestyle]: featureStyle.mjs
[^symbols]: utils/svgSymbols.mjs
[^layerstyle]: ui/elements/layerStyle.mjs icon_scaling()
