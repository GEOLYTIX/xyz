---
title: Workspace

layout: root.html
---

# Workspace API

The [Workspace API module](https://github.com/GEOLYTIX/xyz/blob/master/mod/workspace/_workspace.js) provides methods to retrieve the cached workspace or components of it from the XYZ Host.

### /api/workspace/get

Will return a JSON object of the complete workspace.

```
{
  templates: {...},
  locales: {...}
}
```

### /api/workspace/get/locales

Will return an array of accessible locales.

```
[
  {
    "key": "UK",
    "name": "UK"
  },
  {
    "key": "Japan",
    "name": "日本"
}
]
```

### /api/workspace/get/locale?locale=[key]

Will return the workspace object a single locale. The locale key must be provided as request parameter.

```
{
  "key": "UK",
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
    "Mapbox Base",
    "Grid",
    "Retail Places"
  ]
}
```

### /api/workspace/get/layer?layer=[key]&locale=[key]

Will return the layer configuration from a layer template. If a locale parameter is provided the layer will be returned with the locale layer configuration assigned to the layer template object.

```
{
  "format": "tiles",
  "URI": "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "attribution": {
    "© OpenStreetMap": "http://www.openstreetmap.org/copyright"
  }
}
```

### /api/workspace/get/templates

Will return a list of html links for the individual templates available in the workspace. Links for templates which failed to load from source will be coloured red.

### /api/workspace/get/template?template=[key]

Will return the template object or an error message if the Workspace API failed to load from source. Template methods such as the render function are not displayed in the JSON representation of the template.