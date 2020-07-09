---
title: Styles
tags: [workspace]
layout: root.html
---

# Styles

Style objects define how geometries are drawn in the map. Style objects are merged with Object.assign(). This means that a highlight or theme style only needs to define the style elements which should be ammended to or overwrite the default style.

```json
"style": {
  "default": {
    "strokeColor": "#004BA8",
    "fillColor": "#ffffff",
    "fillOpacity": 0.8,
    "strokeWidth": 1

  },
  "highlight": {
    "strokeColor": "#ff69b4",
    "strokeWidth": 2
  }
}
```

## Icons

Icons can be defined as marker to represent a point location in the rendered map.

```json
"style": {
  "marker": {
    "svg": "https://cdn.jsdelivr.net/gh/GEOLYTIX/mapicons/coffee/bean_blue.svg",
    "anchor": [
      0.5,
      0.95
    ]
  },
  "markerMin": 20, // optional
  "markerMax": 40 
}
```

## Labels

Label for locations on cluster or MVT layer are created as a seperate layer to make use of Openlayers declutter capability to prevent overlapping map labels. The label itself is created as an [Openlayers Text object](https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html).

The entries in the label object will be assigned to the text style. '12px sans-serif' will be the default is not explicitly set.

The field defines which location field will be shown as the location's label.

```json
"label": {
  "field": "store_name",
  "declutter": true,
  "strokeColor": "#ffffff",
  "strokeWidth": 3
}
```

## Hide the style panel

Setting a flag `hidden=true` in the style configuration will hide the style panel in the layer view. A legend will still be shown for a theme but the theme can not be changed with the hidden flag.