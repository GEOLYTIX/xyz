---
title: PostGIS Data Layer
tags: [configure]
layout: root.html
---

Data layers from PostGIS tables require additional connection parameter.

`"dbs": "XYZ"`

The dbs key value must match a database connection in the environment settings. The key value XYZ requires a database connection DBS\_XYZ.

`"table": "schema.eu_nuts_lv0"`

The table value must match a table in the database defined by the dbs parameter. The table name can be prefixed with a schema separated from the table name with a dot.

```javascript
"tables": {
  "6": "eu_nuts_lv0",
  "7": "eu_nuts_lv0",
  "8": "eu_nuts_lv0",
  "9": "eu_nuts_lv0",
  "10": "eu_nuts_lv0",
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