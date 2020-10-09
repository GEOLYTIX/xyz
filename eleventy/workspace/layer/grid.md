---
title: Hex Grid
tags: [workspace]
layout: root.html
---

# Grid layer

Hex grid layers need to be prepared in a PostGIS database. It is recommended to create a series of grid layer for different zoom level. Grid layers are styled with a special bi-variate theme. The grid panel allows to control which field should be used to define the size of a grid cell and a second field is applied to colour grid cells.

Grid layers do not have locations and grid cells can not be selected.

## **Grid fields**

The fields available for the styling of grid layers must be defined in the **grid_fields** entry.

```json
"grid_fields": {
  "Population 2001": "pop__01",
  "Population 2011": "pop__11",
  "Female population": "gen_female__11",
  "Male population": "gen_male__11"
}
```

It is possible to set in the layer entry which fields should be set as the default.

`"grid_color": "pop__11"`

The default field to be used for the color scale can be set as **grid_color**.

`"grid_size": "pop__01"`

The default field to be used for the size scale can be set as **grid_size**.