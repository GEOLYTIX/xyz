---
title: Styles
tags: [workspace]
layout: root.html
---

# Styles

Style define how geometries are drawn in the map. Style objects inherit values. This means that a highlight or theme style only needs to define the style elements which should be amended to or overwrite the default style.

### MVT and GeoJSON styling

The snippet below is an example of styling for layers mvt and geojson. It is most common for these layer formats to represent polygon and linestring features although they can also contain points.

```json
"style": {
  "default": {
    "strokeColor": "#004BA8",
    "fillColor": "#ffffff",
    "fillOpacity": 0.8,
    "strokeWidth": 1

  },
  "marker": {
    "type": "circle",
    "strokeColor": "#083D77"
  },
  "highlight": {
    "strokeColor": "#ff69b4",
    "strokeWidth": 2
  }
}
```

`"marker"` is an optional setting which applies in case of point features displayed on MVT and GeoJSON layers. For more details of marker-style settings check section on Icons. 

Style object also supports `zIndex` property which modifies the drawing order of the layer.
For most layers default `zIndex` is 1 while for cluster layers it equals to 10.

By default cluster layers are drawn on `"zIndex: 10"`. In order to set custom `"zIndex"` add the following to the layer style settings:

```json
"style": {
  "zIndex": 25
}
// tile layer will be drawn on zIndex: 25.
```

### Cluster styling

Cluster features inherit their style from style.default object.
Default marker size is 20, default scale equals to 1.

Cluster scale defaults to 1.2 and highlight scale defaults to 1.3. 

```json
{
  "default": {
    "type": "target",
    "fillColor": "#cddc39"
  },
  "cluster": {
    "fillColor": "#ff9800"
  }
}
```

Cluster of location inherits default settings and takes scaled size unless overridden.

Here's an example of inherited styles:

```json
"style": {
  "default": {
    "showInHeader": true,
    "type": "target",
    "fillColor": "#ffb300",
    "size": 30
  },
  "cluster": {
    "type": "dot",
    "fillColor": "rgba(0, 75, 168, 0.3)",
    "scale": 2
  },
  "highlight": {
    "scale": 2.1
  }
}
```

Please note that `"size"` defined inside `"cluster"` object is a maximum size of cluster icon.

`"showInHeader"` is an optional flag which shows default icon in the layer panel to help differentiating layers in the list.

Supported types of markers:

* svg
* target
* triangle
* square
* semiCircle
* dot
* markerColor
* markerLetter
* geo


## Icons

Icons can be defined as marker to represent a point location in the rendered map.

```json
"style": {
  "default": {
    "svg": "https://cdn.jsdelivr.net/gh/GEOLYTIX/mapicons/coffee/bean_blue.svg",
    "anchor": [
      0.5,
      0.95
    ],
    "scale": 2
  }
}
/* scale is optional */
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

In order to display labels by default add `"display": true`.
To include count on clustered features add `"count": true`.

## Hide the style panel

Setting a flag `hidden=true` in the style configuration will hide the style panel in the layer view. A legend will still be shown for a theme but the theme can not be changed with the hidden flag.
