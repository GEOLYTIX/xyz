---
title: Layer
tags: [workspace]
layout: root.html
orderPath: /workspace/layer/_layer
---

# Layer

Layers are a sub setting of a locale. Each layer object has a set of parameters which depend on the type of layer, whether the layer is interactive or editable and how the data should be styled in the map window. 

Valid layers for the current locale will be listed in the Layers control of the client application.

The drawing order of layers is dependent on the order of the layer keys in the layers object. **Layers added last to the list will be drawn on top.**

```javascript
"layers": {
  "base": {
    "group": "Base maps",
    "display": true,
    "name": "Mapbox Baselayer",
    "attribution": {
      "© Mapbox" : "https://www.mapbox.com/about/maps",
      "© OpenStreetMap": "http://www.openstreetmap.org/copyright"
    },
    "format": "tiles",
    "URI": "https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?&provider=MAPBOX"
  }
}
```

A layer will be listed by it's name. If no name has been set for a layer it will be listed under it's key in the locales object.

`"display": true`

If the display key is set to true the layer will be displayed by default. Otherwise the layer display can be toggled through the client interface.

`"hidden": true`

A layer can be hidden from the layers list. It is still possible to select locations from hidden layers and aggregate scores from hidden layers can be used in lookup fields. Hidden layers can be used as scratch layers to store aggregate locations created from running filter outputs.

`"group": "Base maps"`

Groups will be created for every unique group name found in any of the layer definitions. Layers will be nested in their respective group in the Layers control.

`"meta": "Satellite Imagery layer provided by HERE."`

The meta value will be displayed as text directly under the layer header in the Layer control of the client application.

```text
"attribution": {
  "© Mapbox" : "https://www.mapbox.com/about/maps",
  "© OpenStreetMap": "http://www.openstreetmap.org/copyright"
}
```

The attribution object can hold multiple key/value pairs. The key being the text displayed in the lower right corner of the map control when the corresponding layer is visible and the value being the link for the attribution text.

`"format": "tiles"`

The format value is mandatory for valid layers. The layer type defines the additional parameter a layer may use. The additional parameter are described in the individual format sections.

Data layers from PostGIS tables require additional connection parameter.

`"dbs": "XYZ"`

The dbs key value must match a database connection in the environment settings. The key value XYZ requires a database connection DBS\_XYZ.

`"table": "schema.eu_nuts_lv0"`

The table value must match a table in the database defined by the dbs parameter. The table name can be prefixed with a schema separated from the table name with a dot.

```javascript
"tables": {
  "10": null,
  "11": "eu_nuts_lv0",
  "12": "eu_nuts_lv0",
  "13": "eu_nuts_lv0",
  "14": "eu_nuts_lv0",
  "15": null
}
```

A tables object can be provided instead of the table key. With a single table key the layer will be visible on all zoom levels in a locale. It is possible to set a tables object with key value/pairs defining which table should provide the data at the zoom level represented by the key.

Setting a null value will prevent the layer to be visible on the zoom level and beyond the defined range.

PostGIS data layers also require a geometry field to be defined in the layer settings. The definition of the geometry field varies with the layer format.

`"geom": "geometry"`

The name of the field which stores the layer features geometry. The geometry field should use a spatial index.

`"srid": "4326"`

The PostGIS SRID (EPSG) for the layer geometries projection.