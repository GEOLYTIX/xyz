---
type: Workspace Key
title: Themes
description: layer.style.theme(s) style features by a property value as basic, categorized, graduated or distributed themes with a legend; use for thematic maps.
resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
tags: [workspace, layer, style, theme, legend, mapp]
status: draft
x-xyz-keys:
  - { key: layer.style.theme, type: [object, string], ref: theme }
  - { key: layer.style.themes, type: object }
  - { key: layer.style.themes.*, type: object, ref: theme }
  - { key: theme, type: object }
  - { key: theme.skip, type: boolean }
  - key: theme.type
    type: string
    examples: [basic, categorized, distributed, graduated]
    required: true
    description: The theme method of mapp.layer.themes; a theme with an unknown or missing type is ignored with a warning. Plugins add values to the registry; see plugin-extensions.md.
  - { key: theme.title, type: string }
  - { key: theme.meta, type: string }
  - { key: theme.label, type: string, description: The legend label beside the symbol of a basic theme. }
  - { key: theme.style, type: object, ref: style }
  - { key: theme.setLabel, type: string }
  - { key: theme.setHover, type: string }
  - key: theme.legend
    type: object
    open: true
    description: Legend layout; a jenks distribution also passes it to formatNumericValue, eg. prefix, suffix and round for the category labels.
  - { key: theme.legend.layout, type: string, default: grid }
  - { key: theme.legend.nowrap, type: boolean }
  - { key: theme.legend.classList, type: string, description: Set by the ui from layout and nowrap; a configured value is replaced. }
  - { key: theme.legend.showEmptyCat, type: boolean, description: Show categories without features in a count distribution legend. }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: registry
    resource: ../../../../apps/mapp/lib/layer/_layer.mjs
  - id: featureStyle
    resource: ../../../../apps/mapp/lib/layer/featureStyle.mjs
  - id: basicLegend
    resource: ../../../../apps/ui/lib/layers/legends/basic.mjs
  - id: legendUtils
    resource: ../../../../apps/ui/lib/layers/legends/utils.mjs
  - resource: ../../../../apps/mapp/lib/layer/themes/basic.mjs
  - resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
  - resource: ../../../../apps/mapp/tests/layer/themes
  - resource: ../../../../apps/ui/tests/layers/legends
---
# Themes

A theme styles each feature by its `field` value. `style.themes` maps named
themes, offered in a dropdown; `style.theme` names the current one, or the
first is used. `skip` removes a theme; the key is the default `title`; `meta`
is HTML under the legend.[^parser] `setLabel` and `setHover` switch the
[label and hover](labels-hovers.md) with the theme.

Theme styles merge over `style.default`; a category style set to `null`,
eg. by toggling it in the legend, hides its features.

| `type` | Style comes from |
| --- | --- |
| `basic` | `theme.style` for every feature |
| `categorized` | The category whose `value` equals the feature's `field` value |
| `graduated` | The numeric category range the value falls into |
| `distributed` | Categories handed out so that neighbouring features differ |

`type` must be a key of `mapp.layer.themes`, which
[plugins extend](../../../plugin-extensions.md);[^registry] a theme with an
unknown or missing `type` is ignored with a warning and features keep the
default style.[^featureStyle] The ui legend dispatches on the same four types.

[Theme categories](theme-categories.md) describes `field`, `categories`,
graduated breaks and data distributions of the other three types.

## Basic

A basic theme spreads `style` over every feature. Its legend shows one
symbol from `style` (24px by default) with `label` beside it; without
`label` the legend row has no text.[^basicLegend]

## Legend

`legend.layout` (default `grid`) and `legend.nowrap` set the css classes of
the legend; the ui derives `legend.classList` from them.[^legendUtils]
`legend.showEmptyCat` keeps categories with a zero count in a `count`
distribution legend. A jenks distribution formats its category labels with
the `legend` object as numeric formatter params, so it may carry formatter
keys too.

# Examples

Countries in a graduated population theme, and a basic theme.

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
          "default": { "fillOpacity": 0.7, "strokeColor": "#fff", "strokeWidth": 1 },
          "themes": {
            "population": {
              "type": "graduated",
              "field": "pop_est",
              "categories": [
                { "value": 10000000, "label": "Up to 10m", "style": { "fillColor": "#fee5d9" } },
                { "value": 100000000, "label": "Up to 100m", "style": { "fillColor": "#fb6a4a" } },
                { "value": 2000000000, "label": "Over 100m", "style": { "fillColor": "#a50f15" } }
              ]
            },
            "countries": {
              "type": "basic",
              "label": "Country",
              "style": { "fillColor": "#1b9e77" }
            }
          }
        }
      }
    }
  }
}
```

[^parser]: styleParser.mjs parseTheme
[^registry]: _layer.mjs themes
[^featureStyle]: featureStyle.mjs
[^basicLegend]: legends/basic.mjs
[^legendUtils]: legends/utils.mjs themeLegend, catElement
