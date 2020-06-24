---
title: Workspace
tags: [develop]
layout: root.html
---

# Workspace API

The Workspace API provides methods to retrieve configuration objects and request the chaching of the workspace in other XYZ APIs.

A method must be provided to the Workspace API.

Valid methods are **get** and **cache**.

The Workspace API will redact responses if roles are assigned.

### /api/workspace/get

Will return the complete workspace; All templates and locales.

```
{
  templates: {...},
  locales: {...}
}
```

### /api/workspace/get/locales

Will return an array of all locale keys.

```
["uk",...]
```

### /api/workspace/get/locale?locale=[key]

Will return the locale json with layers as an array of layer keys.

```
{
  "key": "uk",
  "bounds": {
    "north": 62,
    "east": 5,
    "south": 49,
    "west": -13
  },
  "minZoom": 2,
  "maxZoom": 17,
  "showScaleBar": true,
  "layers": [
    "OSM",
    "Stores"
  ]
}
```

### /api/workspace/get/layer?layer=[key]&locale=[key]

Will return the layer configuration from a layer template. If a locale parameter is provided the layer will be returned with the locale layer configuration assigned to the layer template object.

```
{
  "display": true,
  "format": "tiles",
  "attribution": {
    "© OpenStreetMap": "http://www.openstreetmap.org/copyright"
  },
  "URI": "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "key": "OSM"
}
```

### /api/workspace/get/templates

Will return a list of html links for the individual templates available in the workspace. Links for templates which failed to load from source will be coloured red.

### /api/workspace/get/template?template=[key]

Will return the template rendered to string or an error message if the Workspace API failed to load from source.

### /api/workspace/cache

The cache method requires admin workspace access. If authenticated, requests will send to the View, Query, Gazetteer, Layer, and Location API with the URL parameter cache as true. Upon receiving the cache request each API will cache the workspace from its source. XYZ will cache the workspace upon invocation if the current memorized workspace is null. It is required to call the cache method of the Workspace API should the workspace change at the source.