---
title: Locale
tags: [configure]
layout: root.html
---

# Locales

Locales are regional sub settings. Each locale is defined by a name, bounds and a set of layers.

It is possible to switch locales via the dropdown in the Layers control. The dropdown is only visible if more than one locale is defined in the workspace.

The current local is defined as a url hook. For example [https://geolytix.xyz/open/?locale=Global](https://geolytix.xyz/open/?locale=Global) will open the Global locale from the settings for the /open instance. If not defined, the first locale in the locales object will be the default.

This example shows all possible options:

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

