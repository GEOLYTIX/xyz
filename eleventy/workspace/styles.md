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
  }
}
```