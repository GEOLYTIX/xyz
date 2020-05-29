---
title: MapBox Vector Tile (MVT) Layer
tags: [configure]
layout: root.html
---

MVT layer are vector layers which read the geometry column from a PostGIS table. The XYZ backend splits the map view into tiles and compresses the geometry as well as properties into the vector tile PBF format using the [MapBox Vector Tile specification](https://www.mapbox.com/vector-tiles/specification).

### **MVT geometry**

`"geom_3827": "geom_3857"`

MVT layer require a PostGIS geometry column of the type GEOMETRY\(POLYGON,3857\) or GEOMETRY\(MULTIPOLYGON,3857\). By default the geom value will be set to 'geom\_3857'.

## MVT parameter

Geometries rendered in a Mapbox Vector Tile may have encoded attributes which can be used to style the feature in the client map. The list of attributes to be rendered into MVTs is defined in the mvt\_fields layer entry. Without the encoded attribute rendered into a tile a theme which uses the respective field may not be applied.

`"mvt_fields": ["location_type", "location_income", "price"]`

It is possible to assign SQL as fields to be used in themes.

```text
"mvt_fields": [
  "pop_est",
  "gdp_md_est",
  "gdp_md_est_edit::numeric / (pop_est_edit::numeric + 1) * 1000 as gdp_pp",
  "(pop_est_edit / st_area(geom_3857)) * 1000 as pop_dens"
]
```

The fields gdp\_pp and pop\_dens which do not exist in the PostGIS table itself may now be used in themes as field definition. The calculated values will be stored in cached tiles.

Tile caches need to be truncated if the list of attribute fields changes.

It is possible to enable the caching backend rendered MVT thus reducing the response time when accessing accessing cached tiles.

`"mvt_cache": "{tablename}__mvts"`

The cache table will be generated during the workspace load sequence. Cached tiles contain a list of table fields. The cache table will be truncated \(during workspace load sequence\) if the list is changed to include fields which were not previously contained in cached tiles.

## **MVT locations**

`"qID": "optional"`

Setting the **qID** as a valid id column for the database table will make vector locations selectable. There is no default for the qID value. The qID value together with the table and dbs parameter will be tested during the workspace load.

Additional parameter will be discussed in the locations section of this document.

## MVT styling

Strokes as well as polygon fills can be styled for vector layers. In order to select a layer a transparent fill must be applied. Otherwise the polygon will be drawn as an outline only.

```javascript
"style": {
  "default": {
      "weight": 1,
      "color": "#333333",
      "fill": true,
      "fillColor": "#333333",
      "fillOpacity": 0.1
  },
  "highlight": {
      "weight": 2,
      "color": "#009900",
      "fill": true,
      "fillColor": "#ccff99",
      "fillOpacity": 0.2
  },
  "themes": {}
}
```

The highlight style is applied when the mouse cursor hovers over a selectable item.

## **Vector themes**

Categorized and graduated themes can be applied to vector layers \(MVT / GeoJSON\).

**Theme styles are adaptive.** The marker and markerMulti definition will be augmented by the style elements in theme's categories \(cat\).

### Categorized theme

Categorized themes allow to paint vector maps with the style representing specific categories.

```javascript
"Retail Place type": {
  "type": "categorized",
  "field": "rp_type",
  "other": true,
  "cat": {
    "Major City Centre": {
      "label": "Major City Centre",
      "color": "#EF271B",
      "fillColor": "#EF271B"
    },
    "City Centre": {
      "label": "City Centre",
      "color": "#BA2D0B",
      "fillColor": "#BA2D0B"
    },
    "Large Town Centre": {
      "label": "Large Town Centre",
      "color": "#FE4E00",
      "fillColor": "#FE4E00"
    },
    "Major Urban Centre": {
      "label": "Major Urban Centre",
      "color": "#E2711D",
      "fillColor": "#E2711D"
    }
  }
}
```

A categorized theme requires as a minimum the type, field, and cat properties. The type is **categorized**. The **field** value must be a column in the PostGIS table which can be used to categorize a location. **cat** is an array like object which lists the different categories as key/value pairs. The key is used to identify the category of a location while the value defines the styling of the marker as well as the label which should be shown in the legend.

`"other": true`

The other entry will show a marker for values which do not match a category key in the theme's legend.

Entries \(label\) in the categorized theme legend can be used to filter the respective category.

### **Graduated vector theme**

Locations \(vector features\) fall into a graduated theme category when their \(theme\) field value is larger then the categories key \(parsed\) but smaller than the subsequent category's key \(parsed\).

```coffeescript
"Population '11": {
  "type": "graduated",
  "field": "pop_11",
  "cat": {
      "0": {
          "label": "0 to 10000",
          "fillColor": "#15773f"
      },
      "100": {
          "label": "10000 to 25000",
          "fillColor": "#66bd63"
      },
      "200": {
          "label": "25000 to 50000",
          "fillColor": "#a6d96a"
      },
      "300": {
          "label": "50000 to 100000",
          "fillColor": "#d9ef8b"
      },
      "400": {
          "label": "100000 to 250000",
          "fillColor": "#fdae61"
      },
      "500": {
          "label": "250000 to 500000",
          "fillColor": "#f46d43"
      },
      "600": {
          "label": "500000 or more",
          "fillColor": "#d73027"
      }
  }
};
```

Graduated categories cannot be filtered from the legend.