---
title: Locale
tags: [workspace]
layout: root.html
group: true
orderPath: /workspace/locales/_locales
---

# Locale

Locales are regional sub settings. The XYZ Library may load a locale from the Workspace API to provide a complex configuration object for the creation of an OpenLayers Mapview control.

Each locale is commonly defined by a name, bounds, and a set of layers.

A locale is defined by a key/value entry in the locales object of a workspace. The locale **key** is used to reference the locale in requests to the XYZ API.

```javascript
"locales": {
  "Global": {...}
  "UK": {
    "name": "United Kingdom",
    "gazetteer": {...},
    "bounds": {
      "north": 62,
      "east": 5,
      "south": 48,
      "west": -13
    },
    "showScaleBar": true,
    "maskBounds": true,
    "view": {
      "lat": 45,
      "lng": 60,
      "z": 3
    },
    "minZoom": 6,
    "maxZoom": 17,
    "layers": {...}
  }
}
```

Locales are JSON objects with a set of parameter.

The **name** value will be displayed in the locale dropdown. The locale key will be the default for the name value.

The locale's **bounds** are defined by their northern, eastern, southern and western border. The default bounds are for a global view.

Setting the **showScaleBar** entry will show a scale bar in the lower left corner of the map:

![](../../../assets/img/locales_1.png)

Setting the **maskBounds** entry will put a mask on the region which falls outside the locale bounds:

![](../../../assets/img/locales_1.png)

The **min** and **maxZoom** define the outer zoom levels for the map object. The default zoom range is from 2 to 20.

Setting the **view** with latitude \(**lat**\), longitude \(**lng**\), and zoom \(**z**\) will define the view which is loaded if not overridden by either the init parameter or url hooks.

