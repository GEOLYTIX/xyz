---
type: Workspace Key
title: Point icons and icon scaling
description: style.icon symbols, image URLs and SVG templates, and layer.style.icon_scaling; use to draw and scale point features.
resource: ../../../../apps/mapp/lib/utils/svgSymbols.mjs
tags: [workspace, layer, style, icon, mapp]
status: draft
x-xyz-keys:
  - { key: style.icon, type: [object, array], description: An icon, or an array of icons drawn on top of each other. }
  - { key: style.icon.type, type: string, default: dot, examples: [dot, target, triangle, square, diamond, semiCircle, markerLetter, markerColor, circle, template], description: The mapp.utils.svgSymbols method drawn when the icon has no url. Plugins add values to the registry; see plugins/extension-points.md. }
  - { key: style.icon.url, type: string, description: Image or SVG URL; takes precedence over type. }
  - { key: style.icon.svg, type: string, deprecated: style.icon.url }
  - { key: style.icon.scale, type: number, default: 1 }
  - { key: style.icon.anchor, type: array, default: [0.5, 0.5], description: "Icon anchor as [x, y] fractions of the icon size." }
  - { key: style.icon.fillColor, type: string, description: Fill of the dot, target, triangle, square, diamond and semiCircle symbols. }
  - { key: style.icon.layers, type: object, description: Inner rings of the dot-like symbols, a map of size fractions (0 to 1) to colours. }
  - { key: style.icon.layers.*, type: string }
  - { key: style.icon.strokeColor, type: string, default: "#333", description: Ring colour of the circle symbol. }
  - { key: style.icon.strokeWidth, type: number, default: 1, minimum: 0, description: Ring width of the circle symbol. }
  - { key: style.icon.color, type: string, description: Marker colour of the markerLetter symbol. }
  - { key: style.icon.letter, type: string, description: Text in the markerLetter symbol. }
  - { key: style.icon.colorMarker, type: string, description: Marker colour of the markerColor symbol. }
  - { key: style.icon.colorDot, type: string, description: Dot colour of the markerColor symbol. }
  - { key: style.icon.template, type: string, required: { when: { style.icon.type: template } }, description: Key of a locale.svgTemplates entry drawn by the template type. }
  - { key: style.icon.substitute, type: object, description: Map of strings in the SVG template to their replacements. }
  - { key: style.icon.substitute.*, type: [string, number] }
  - { key: layer.style.icon_scaling, type: object }
  - { key: layer.style.icon_scaling.field, type: string, description: Numeric feature property which scales the icon. }
  - { key: layer.style.icon_scaling.fields, type: object, description: Named fields offered in a style panel dropdown. }
  - { key: layer.style.icon_scaling.fields.*, type: object, open: true, description: Assigned to icon_scaling when selected; may also set scaleFactor, max or cluster. }
  - { key: layer.style.icon_scaling.fields.*.field, type: string }
  - { key: layer.style.icon_scaling.fields.*.title, type: string }
  - { key: layer.style.icon_scaling.scaleFactor, type: number }
  - { key: layer.style.icon_scaling.max, type: number }
  - { key: layer.style.icon_scaling.cluster, type: [boolean, string] }
  - { key: layer.style.icon_scaling.hidden, type: boolean, description: Do not show icon scaling controls in the style panel. }
  - { key: layer.style.icon_scaling.icon, type: boolean }
  - { key: layer.style.icon_scaling.minScale, type: number, default: 0.1 }
  - { key: layer.style.icon_scaling.maxScale, type: number }
  - { key: layer.style.icon_scaling.clusterScale, type: boolean, requires: [layer.style.cluster] }
  - { key: layer.style.icon_scaling.zoomInScale, type: boolean }
  - { key: layer.style.icon_scaling.zoomOutScale, type: boolean }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: symbols
    resource: ../../../../apps/mapp/lib/utils/svgSymbols.mjs
  - id: olstyle
    resource: ../../../../apps/mapp/lib/utils/olStyle.mjs
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: featurestyle
    resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: layerstyle
    resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
  - resource: ../../../../apps/mapp/tests/utils/svgSymbols.test.mjs
  - resource: ../../../../apps/mapp/tests/utils/olStyle.test.mjs
  - resource: ../../../../apps/mapp/tests/layer/featureStyle.test.mjs
  - resource: ../../../../apps/ui/tests/elements/layerStyle.test.mjs
---
# Point icons and icon scaling

A point feature is drawn with the `icon` of its [feature style](feature-style.md):
an object, or an array of icons drawn on top of each other.

## Icons

- `url` draws an image or SVG from a URL. The legacy `svg` is copied to
  `url`.[^parser]
- Without `url`, `type` (default `dot`) draws a built-in SVG symbol. An
  unknown type throws for every feature.[^olstyle]
  - `dot`, `target`, `triangle`, `square`, `diamond` and `semiCircle` are
    filled with `fillColor` (white) and draw inner shapes from `layers`, a map
    of size fractions to colours, eg. `{ "0.5": "#fff" }`.
  - `circle` is an outline of `strokeColor` and `strokeWidth`; `markerLetter`
    a pin of `color` with a `letter`; `markerColor` a pin of `colorMarker`
    with a dot of `colorDot`.
  - `template` draws the `locale.svgTemplates` entry named by `template`,
    replacing each `substitute` key in the SVG string with its value. Without
    a loaded template the icon is not drawn.[^symbols] See [mapview
    configuration](../../locale/view.md).
- `scale` scales the icon; `anchor` positions it, `[0.5, 0.5]` by default.

The rendered scale is `icon.scale` multiplied by the feature style `scale`,
`highlightScale`, and the cluster, field and zoom scales computed per
feature.[^olstyle]

## Icon scaling

`layer.style.icon_scaling` scales icons by a numeric `field`: the scale is
`1 + value / scaleFactor` (or `max`), negative values do not scale. Cluster
icons are only scaled with `cluster`, summing values, or averaging them with
`"avg"`.[^featurestyle] `fields` offers named fields in a dropdown; the
selected entry is assigned to `icon_scaling`, and the first entry's `field` is
the default.[^parser]

The ui adds style panel controls unless `hidden`:[^layerstyle]

- `icon` adds a slider for `style.default.scale`, from `minScale` (0.1) to
  `maxScale` (three times the scale).
- `clusterScale` adds one for `style.cluster.clusterScale`, shown only when the
  cluster style sets it.
- `zoomInScale` and `zoomOutScale` add sliders for the layer.style keys,
  which have no effect ([#3154](https://github.com/GEOLYTIX/xyz/issues/3154)).

## Pitfalls

- `type` and its symbol keys are ignored when `url` is set. A theme category
  icon without either is merged with the default icon.

# Examples

Retail points as lettered markers, drawn as a white dot when highlighted.

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
          "default": {
            "icon": {
              "type": "markerLetter",
              "color": "#e66",
              "letter": "R",
              "anchor": [0.5, 1]
            }
          },
          "highlight": { "icon": { "type": "dot", "fillColor": "#fff" } }
        }
      }
    }
  }
}
```

[^symbols]: utils/svgSymbols.mjs
[^olstyle]: utils/olStyle.mjs iconStyle
[^parser]: styleParser.mjs iconUrlSVG and icon_scaling.fields
[^featurestyle]: featureStyle.mjs iconScalingStyle
[^layerstyle]: ui/elements/layerStyle.mjs icon_scaling()
