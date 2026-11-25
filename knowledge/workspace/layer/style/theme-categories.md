---
type: Workspace Key
title: Theme categories
description: theme.field, theme.categories, graduated_breaks and distribution of categorized, graduated and distributed themes; use to configure theme categories and legends from the data.
resource: ../../../../apps/mapp/lib/layer/themes/categorized.mjs
tags: [workspace, layer, style, theme, legend, mapp]
status: draft
x-xyz-keys:
  - key: theme.field
    type: string
    required: { when: { theme.type: graduated } }
    description: The feature property which selects the category; distributed themes default to id.
  - key: theme.fields
    type: array
    required: { when: { theme.type: categorized }, or: [theme.field] }
    description: Feature properties of a categorized icon theme; each category names its field.
  - key: theme.categories
    type: array
    required: { when: { theme.type: [categorized, distributed, graduated] }, or: [theme.cat, theme.cat_arr] }
  - { key: "theme.categories[]", type: object, ref: style }
  - { key: "theme.categories[].value", type: [string, number] }
  - { key: "theme.categories[].label", type: [string, number], description: Legend label; defaults to value. }
  - { key: "theme.categories[].field", type: string }
  - { key: "theme.categories[].style", type: [object, array], ref: style }
  - { key: "theme.categories[].icon", type: [object, array], description: Shorthand for style.icon; the parser moves it into the category style. }
  - { key: theme.cat, type: object }
  - { key: theme.cat.*, type: object, ref: style }
  - { key: theme.cat.*.label, type: string }
  - { key: theme.cat.*.value, type: [string, number] }
  - { key: theme.cat_arr, type: array }
  - key: theme.graduated_breaks
    type: string
    enum: [less_than, greater_than]
    default: less_than
    description: Whether a graduated category value is the upper (less_than) or lower (greater_than) bound; other values become less_than.
  - key: theme.distribution
    type: string
    examples: [count, jenks]
    description: Compute the legend from the loaded features; count shows present values with counts, jenks sets natural breaks. A method of mapp.layer.featureFields.distribution; plugins add values to it; see plugins/extension-points.md.
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
  - resource: ../../../../apps/ui/lib/layers/legends/utils.mjs
  - resource: ../../../../apps/mapp/tests/layer/themes
  - resource: ../../../../apps/ui/tests/layers/legends
---
# Theme categories

Categorized, graduated and distributed [themes](themes.md) pick a style from
`categories` by the feature's `field` value.

## Categories

`categories` is an ordered array of `{ value, label, style }`; `label`
defaults to `value`. Style keys directly on a category, and an `icon`, move
into its `style`. The legacy `cat`, keyed by value, and `cat_arr` become
`categories`.[^parser]

- **categorized**: values match as text. With `fields` instead of `field`,
  each category names its `field`, and a feature shows the icons of every
  matching category stacked; a category without an icon gets a dot icon with
  a warning. Cluster features are not themed.[^categorized]
- **graduated**: values are numbers, sorted by the parser. `graduated_breaks: less_than` (the default) picks the category with the
  lowest `value` at or above the feature value; `greater_than` the highest
  `value` at or below it. Any other `graduated_breaks` becomes `less_than`.
  Values outside all ranges get the nearest category. Without categories the
  theme is ignored with a warning.[^graduated]
- **distributed**: `field` defaults to `id`; features with the same value share a category.[^distributed]

## Requirements

Without `categories` a categorized or distributed theme throws for every
feature,[^categorized][^distributed] and a graduated theme is
ignored.[^parser] Do not leave the array empty for a distributed theme: assigning the first category fails. Without
`field` a graduated theme, or without `field` or `fields` a categorized
theme, matches no feature.

## Distribution

`distribution` computes the legend from the loaded features:[^fields] `count`
shows only the values present, with counts; `jenks` replaces graduated values
with natural breaks, one per category. To follow the map extent, set
`params.viewport` on vector layers, or `wkt_properties` on MVT layers. Another
`distribution` is ignored.

# Examples

A categorized continent theme with counts, and a jenks population theme.

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
            "continent": {
              "type": "categorized",
              "field": "continent",
              "distribution": "count",
              "categories": [
                { "value": "Europe", "style": { "fillColor": "#1b9e77" } },
                { "value": "Africa", "style": { "fillColor": "#d95f02" } }
              ]
            },
            "population": {
              "type": "graduated",
              "field": "pop_est",
              "graduated_breaks": "greater_than",
              "distribution": "jenks",
              "categories": [
                { "style": { "fillColor": "#fee5d9" } },
                { "style": { "fillColor": "#fb6a4a" } },
                { "style": { "fillColor": "#a50f15" } }
              ]
            }
          }
        }
      }
    }
  }
}
```

[^parser]: styleParser.mjs parseTheme, catStyle
[^categorized]: themes/categorized.mjs
[^graduated]: themes/graduated.mjs
[^distributed]: themes/distributed.mjs
[^fields]: featureFields.mjs distribution
