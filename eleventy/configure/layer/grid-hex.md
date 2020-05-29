---
title: Grid (Hex) Layer
tags: [configure]
layout: root.html
---

Hex grid layers need to be prepared in a PostGIS database. It is recommended to create a series of grid layer for different zoom level. Grid layers are styled with a special bi-variate theme. The grid panel allows to control which field should be used to define the size of a grid cell and a second field is applied to colour grid cells.

Grid layers do not have locations and grid cells can not be selected.

### **Grid geometry**

`"geom": "geom"`

Grid cells require a PostGIS geometry column of the type GEOMETRY\(POINT,4326\). By default the geom value will be set to 'geom'.

## **Grid fields**

The fields available for the styling of grid layers must be defined in the **grid\_fields** entry.

```text
"grid_fields": {
  "Population 2001": "pop__01",
  "Population 2011": "pop__11",
  "Female population": "gen_female__11",
  "Male population": "gen_male__11"
}
```

It is possible to set in the layer entry which fields should be set as the default.

`"grid_color": "pop__11"`

The default field to be used for the color scale can be set as **grid\_color**.

"grid\_size": "pop\_\_01"

The default field to be used for the size scale can be set as **grid\_size**.

## Value distribution

The distribution of values is linear between min, avg and max.

Following method is applied to determine the bounds between the colour bins.

A grid cell falls into a bin if it's value is smaller than the bin's colour value.

```text
for (var i = 1; i < n; i++) {

  if (i < (n / 2)) {
    layer.colorBins.push(min + ((avg - min) / (n / 2) * i));
  }

  if (i === (n / 2)) {
    layer.colorBins.push(avg);
  }

  if (i > (n / 2)) {
    layer.colorBins.push(avg + ((max - avg) / (n / 2) * (i - (n / 2))));
  }
      
}

// with n = 4, min = 0, avg = 3000, max = 30000;
// yield 1500, 3000, 16500

// with n = 4, min = 1000, avg = 3000, max = 30000;
// yield 2000, 3000, 16500

// with n = 5, min = 0, avg = 3000, max = 30000;
// yield 1200, 2400, 8400, 19200

// with n = 5, min = 1000, avg = 3000, max = 30000;
// yield 1800, 2600, 8400, 19200
```