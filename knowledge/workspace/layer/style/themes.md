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
  - { key: theme.type, type: string }
  - { key: theme.title, type: string }
  - { key: theme.meta, type: string }
  - { key: theme.field, type: string }
  - { key: theme.fields, type: array }
  - { key: theme.style, type: object, ref: style }
  - { key: theme.categories, type: array }
  - { key: "theme.categories[]", type: object, ref: style }
  - { key: "theme.categories[].value", type: [string, number] }
  - { key: "theme.categories[].label", type: string }
  - { key: "theme.categories[].field", type: string }
  - { key: "theme.categories[].style", type: [object, array], ref: style }
  - { key: theme.cat, type: object }
  - { key: theme.cat.*, type: object, ref: style }
  - { key: theme.cat.*.label, type: string }
  - { key: theme.cat.*.value, type: [string, number] }
  - { key: theme.cat_arr, type: array }
  - { key: theme.graduated_breaks, type: string, default: less_than }
  - { key: theme.distribution, type: string }
  - { key: theme.setLabel, type: string }
  - { key: theme.setHover, type: string }
  - { key: theme.legend, type: object }
  - { key: theme.legend.layout, type: string }
  - { key: theme.legend.nowrap, type: boolean }
  - { key: theme.legend.classList, type: string }
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: parser
    resource: ../../../../apps/mapp/lib/layer/styleParser.mjs
  - id: categorized
    resource: ../../../../apps/mapp/lib/layer/themes/categorized.mjs
  - id: graduated
    resource: ../../../../apps/mapp/lib/layer/themes/graduated.mjs
  - id: distributed
    resource: ../../../../apps/mapp/lib/layer/themes/distributed.mjs
  - id: fields
    resource: ../../../../apps/mapp/lib/layer/featureFields.mjs
  - resource: ../../../../apps/mapp/lib/layer/themes/basic.mjs
  - resource: ../../../../apps/ui/lib/elements/layerStyle.mjs
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

An unknown `type` is ignored with a warning. `legend.layout`, `nowrap` and
`classList` change the legend layout in the ui.

## Categories

`categories` is an ordered array of `{ value, label, style }`; `label`
defaults to `value`. Style keys directly on a category move into its `style`.
The legacy `cat`, keyed by value, and `cat_arr` become `categories`.[^parser]

- **categorized**: values match as text. With `fields` instead of `field`,
  each category names its `field`, and a feature shows the icons of every
  matching category stacked. Cluster features are not themed.[^categorized]
- **graduated**: values are numbers, sorted by the parser.
  `graduated_breaks: less_than` (the default) picks the category with the
  lowest `value` at or above the feature value; `greater_than` the highest
  `value` at or below it. Values outside all ranges get the nearest
  category. Without categories the theme is ignored.[^graduated]
- **distributed**: `field` defaults to `id`; features with the same value
  share a category.[^distributed]

## Distribution

`distribution` computes the legend from the loaded features:[^fields] `count`
shows only the values present, with counts; `jenks` replaces graduated values
with natural breaks, one per category. To follow the map extent, set
`params.viewport` on vector layers, or `wkt_properties` on MVT layers.

# Examples

Countries in a graduated population theme, and a categorized continent theme.

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
            "continent": {
              "type": "categorized",
              "field": "continent",
              "categories": [
                { "value": "Europe", "style": { "fillColor": "#1b9e77" } },
                { "value": "Africa", "style": { "fillColor": "#d95f02" } }
              ]
            }
          }
        }
      }
    }
  }
}
```

[^parser]: styleParser.mjs parseTheme
[^categorized]: themes/categorized.mjs
[^graduated]: themes/graduated.mjs
[^distributed]: themes/distributed.mjs
[^fields]: featureFields.mjs distribution
