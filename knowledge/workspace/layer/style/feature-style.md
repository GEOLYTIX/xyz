---
type: Workspace Key
title: Feature styles
description: layer.style.default, highlight, selected and cluster styles, the feature style keys, layer opacity and the style panel; use to style any vector or MVT layer.
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
  - { key: layer.style.cluster.logScale, type: boolean, description: Grow cluster icons with the natural log of the cluster size. }
  - { key: layer.style.cluster.zoomInScale, type: number, deprecated: layer.style.zoomInScale }
  - { key: layer.style.cluster.zoomOutScale, type: number, deprecated: layer.style.zoomOutScale }
  - { key: layer.style.zoomInScale, type: number }
  - { key: layer.style.zoomOutScale, type: number }
  - { key: layer.style.opacity, type: number, default: 1, minimum: 0, maximum: 1, description: Opacity of the whole layer. }
  - { key: layer.style.cache, type: boolean, description: Reuse the style computed for each feature. }
  - { key: layer.style.hidden, type: boolean, description: Do not create the style panel. }
  - { key: layer.style.drawer, type: [string, boolean], default: disableOnHide, description: "false shows the panel without an expandable drawer." }
  - { key: layer.style.popout, type: boolean }
  - { key: layer.style.dialog, type: [boolean, object] }
  - { key: layer.style.classList, type: string }
  - { key: layer.style.elements, type: array, description: Order of the style panel elements. }
  - { key: "layer.style.elements[]", type: string }
  - { key: layer.style.opacitySlider, type: boolean, description: Adds an opacity slider to the style panel. }
  - { key: style.fillColor, type: string }
  - { key: style.fillOpacity, type: number, minimum: 0, maximum: 1 }
  - { key: style.strokeColor, type: string }
  - { key: style.strokeWidth, type: number, default: 1, minimum: 0 }
  - { key: style.strokeOpacity, type: number, minimum: 0, maximum: 1 }
  - { key: style.lineDash, type: array, description: "Line and gap lengths in pixels, eg. [5, 4]." }
  - { key: "style.lineDash[]", type: number, minimum: 0 }
  - { key: style.zIndex, type: number, description: Draw order within the layer; the highlight style defaults to Infinity. }
  - { key: style.highlightScale, type: number }
  - { key: style.scale, type: number }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: featurestyle
    resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: olstyle
    resource: ../../../../apps/mapp/lib/utils/olStyle.mjs
  - resource: ../../../../apps/mapp/lib/utils/hexa.mjs
  - resource: ../../../../apps/mapp/lib/layer/decorate.mjs
  - id: panel
    resource: ../../../../apps/ui/lib/layers/panels/style.mjs
  - id: layerstyle
    resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
  - resource: ../../../../apps/ui/lib/elements/drawer.mjs
  - resource: ../../../../apps/mapp/tests/layer/styleParser.test.mjs
  - resource: ../../../../apps/mapp/tests/layer/featureStyle.test.mjs
  - resource: ../../../../apps/mapp/tests/utils/olStyle.test.mjs
  - resource: ../../../../apps/ui/tests/elements/layerStyle.test.mjs
  - resource: ../../../../apps/ui/tests/layers/panels/style.test.mjs
---
# Feature styles

A **feature style** is an object of the `style` keys below. `layer.style`
holds the feature styles a layer uses:

- `default` applies to every feature. Without it the MAPP library warns and
  uses a white fill with a dark stroke, or a dot icon on a cluster
  layer.[^parser]
- `highlight` applies to the feature under the pointer. It is drawn on top
  (`zIndex` Infinity); its `scale` becomes `highlightScale`.
- `selected` replaces the whole style, including theme and label, of
  features whose location is open.
- `cluster` applies to features which stand for several locations. It
  defaults to a dot icon with `clusterScale` 1, which grows the icon with the
  cluster size, or with its natural log with `logScale`.[^featurestyle]
- `opacity` sets the opacity of the whole layer, 0 to 1; 0 is treated as 1.
- `cache` reuses the style computed for a feature; highlight, theme and label
  changes are then not drawn until the features are reloaded.

Themes, labels and hovers add to these; see [themes](themes.md) and
[labels and hovers](labels-hovers.md).

## Feature style keys

`fillColor`, `fillOpacity`, `strokeColor`, `strokeWidth` (1) and
`strokeOpacity` style lines and polygons; `lineDash` dashes the stroke.
Opacities, 0 to 1, are only applied to 4 or 7 character hex colours.
`zIndex` orders the styles within the layer. A point needs an `icon`; see
[point icons](icons.md).[^olstyle]

## Style panel

The ui shows a style drawer in the layer view unless `hidden`.[^panel]
`elements` orders its controls, by default `labels`, `label`, `hovers`,
`hover`, `themes`, `theme`, `icon_scaling` and `opacitySlider`. An element is
only shown when `layer.style` has its key, so `opacitySlider: true` adds the
opacity slider.[^layerstyle] `drawer` is `disableOnHide` (disabled while the
layer is hidden), or `false` for a panel without drawer; `popout`, `dialog`
and `classList` change how it is shown.

## Pitfalls

- A cluster layer keeps only `icon` and `scale` in `style.default`; other keys
  are removed with a warning.
- `layer.style.zIndex`, `layer.hover` and `layer.icon_scaling` are legacy;
  use `layer.zIndex`, `layer.style.hover` and `layer.style.icon_scaling`.
  `layer.style.zIndex` only warns and has no effect.
- A `style` object inside `style.default` is unwrapped with a warning.
- `layer.style.zoomInScale` and `zoomOutScale` are meant to scale icons with
  the zoom level. The parser moves a cluster style's keys there, but the
  feature style function reads them from `style.cluster`, so they currently
  do not change the render.

# Examples

Grey dashed countries with a yellow highlight and an opacity slider.

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
          "default": { "fillColor": "#d9d9d9", "fillOpacity": 0.5, "strokeColor": "#555", "lineDash": [4, 2] },
          "highlight": { "fillColor": "#dbd56e", "fillOpacity": 0.7 },
          "opacitySlider": true
        }
      }
    }
  }
}
```

[^parser]: styleParser.mjs warnings and clusterChecks
[^featurestyle]: featureStyle.mjs clusterStyle
[^olstyle]: utils/olStyle.mjs
[^panel]: ui/layers/panels/style.mjs
[^layerstyle]: ui/elements/layerStyle.mjs panel()
