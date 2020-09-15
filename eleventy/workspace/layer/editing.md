---
title: Layer editing
tags: [workspace, layer, interaction, draw, edit]
layout: root.html
---

Layers support edit and draw interactions. 
In order to enable function of adding new features to the layer add the following:

```json
"edit": {}
```

`"layer.edit"` holds parameters which determine drawing and editing interactions.
The following geometries are currently supported:

```json
"edit": {
	"point": true,
	"polygon": true,
    "freehand": true,
    "circle": true,
    "rectangle": true,
    "line": true,
    "point": true,
    "isoline_mapbox": true,
    "isoline_here": true                
}
```

Isolines along with their custom parameters are provided by HERE API and/or Mapbox API.

In order to enable deleting features or editing their geometries add the following:

```json
"edit": {
    "delete": true,
    "geometry": true                 
}
```

Drawing interaction supports labels on interaction parameters. To display labels use parameters from the example below:

```json
"polygon": {
	"tooltip": "length"
},
"circle": {
	"tooltip": "distance"
},
"rectangle": {
    "tooltip": "area"
},
"line": {
	"tooltip": "length"
}
```

Note that in order to enable editing properties of selected locations editable entries need their own editing settings. 