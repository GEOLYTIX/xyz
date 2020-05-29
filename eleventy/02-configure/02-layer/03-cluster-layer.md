---
title: Cluster Layer
tags: [configure]
layout: root.html
---

Cluster layer are point layers. [A combination of PostGIS cluster algorithm](https://medium.com/@goldrydigital/cluster-f-x-nesting-postgresql-kmeans-in-dbscan-for-responsive-maps-9ed99590a439) are applied by the XYZ backend in order to display aggregate cluster for large point location datasets in the map control.

It is possible to select individual locations from an aggregate cluster and theme the cluster based on their aggregate scores.

The size of a cluster represents the count of locations which are aggregated into a cluster.

The cluster panel is not drawn by default. Setting the layer property `cluster_panel:true`, will draw the cluster panel.

### **Cluster geometry**

`"geom": "geom"`

Cluster layer require a PostGIS geometry column of the type GEOMETRY\(POINT,4326\). By default the geom value will be set to 'geom'.

## **Cluster parameter**

The cluster algorithm which is used to aggregate locations can be specified with additional cluster parameter.

`"cluster_kmeans": 0.05`

**cluster\_kmeans** defines the minimum number of cluster. The number is determined by 1 over the kmeans value \(eg. KMeans 0.05 will generate a minimum number of 20 cluster\). The XYZ backend will adjusted KMeans by the absolute number of locations in a map view. The KMeans value can be altered through the cluster panel. _The default value is 0.5._ **A lower KMeans value will produce more cluster.**

`"cluster_dbscan": 0.01`

**cluster\_dbscan** defines the maximum distance between locations in a cluster. The applied value is a ratio of the cross distance across the map view \(eg. DBScan 0.01 with 10km cross distance of the map view will set the maximum distance between locations to 100 meter\). _The default value is 0.01._ **A higher DBScan value will produce more cluster.**

## **Cluster locations**

`"qID": "optional"`

Setting the **qID** as a valid id column for the database table will make cluster locations selectable. There is no default for the qID value. The qID value together with the table and dbs parameter will be tested during the workspace load.

`"cluster_label": "optional"`

**cluster\_label** defines the label which is shown in the select dialog for multiple locations in a cluster. If not defined, the qID value will be shown in the select dialog.


## **Hover**

`"hover": {
  "field": "location_name" // field name pointing to label text content
  }`

Hovering labels can be displayed on single cluster features. In order to enable them set `"hover": {}` parameter on cluster layer. `"field"` property will point to text content displayed in the label.

Labels can be displayed on mouse hover or permanent. In order to set labels as permanent set the following:

`"hover": {
  "field": "location_name",
  "permanent": "true | false"
  }`

Setting `"permanent"` parameter allows hiding or showing all labels with a button visible in the layer style panel.
Setting `"permanent": false` will set labels as permanent but hidden by default.


## Cluster styling

Cluster are represented by marker on the map. Two different markers can be defined for single location cluster or multi location cluster. Markers can be svg resources or generated from a set of instructions. The default marker is a 'target' which is displayed as simple circle by default or multiple shapes of varying size and colour.

```javascript
"style": {
  "markerMin": 20,
  "markerMax": 40,
  "anchor": [20, 40], // optional anchor can align location icon with selection marker
  "marker": {
    "type": "target",
    "fillColor": "#999999"
  },
  "markerMulti": {
    "type": "target | triangle | square",
    "fillColor": "#333333"
  },
  "themes": {}
}
```

Icons for markers can be stored externally. The following example uses a public Github repository:

```text
"marker": {
  "svg": "https://raw.githubusercontent.com/GEOLYTIX/MapIcons/master/poi_pin_filled/poi_health_hospital.svg?sanitize=true"
}
```

Finally, markers can be also set to raw SVG dataURI:

```text
"marker": {
  "svg": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMjEgMTZ2LTJsLTgtNVYzLjVjMC0uODMtLjY3LTEuNS0xLjUtMS41UzEwIDIuNjcgMTAgMy41VjlsLTggNXYybDgtMi41VjE5bC0yIDEuNVYyMmwzLjUtMSAzLjUgMXYtMS41TDEzIDE5di01LjVsOCAyLjV6IiBmaWxsPSIjMmU3NzA5Ii8+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg=="
```

### **Marker**

The default target marker is defined by their fillColour only.

```javascript
"fillColor": "#ee8a00",
"layers": {
  "0.5": "#ffffff",
  "0.35": "#ee8a00"
}
```

Complex `target | triangle | square` marker can be created by adding additional layers to the marker definition. The size of the fillColour shape is 1. Additional layers will be drawn in the order of their defintion in the layers entry. The key is the size of the shape as a fraction of 1. Larger shapes must be defined first or will otherwise be hidden underneath drawn layers subsequently.

To use alternative marker shape use "triangle" and "square". They also accept "layers" parameters. For triangle markers consider larger marker size as triagles have smaller area than other shapes.

## Themes

Cluster layers support categorized, graduated and competition themes. A theme must have a unique name as key in the themes object. The type of the theme must be defined in the theme entry.

**Theme styles are adaptive.** The marker and markerMulti definition will be augmented by the style elements in theme's categories \(cat\).

### **Categorized cluster theme**

```javascript
"Retailer": {
  "type": "categorized",
  "field": "retailer",
  "other": true,
  "cat": {
      "Tesco": {
          "label": "Tesco",
          "fillColor": "#0055a8",
          "layers": {
              "0.75": "#ffffff",
              "0.35": "#f02f26"
          }
      },
      "Sainsburys": {
          "label": "Sainsbury's",
          "fillColor": "#ee8a00",
          "layers": {
              "0.5": "#ffffff",
              "0.35": "#ee8a00"
          }
      },
      "Marks and Spencer": {
          "label": "Marks & Spencer",
          "fillColor": "#0a0d10",
          "layers": {
              "0.5": "#def036",
              "0.25": "#0a0d10"
          }
      }
  }
}  
```

A categorized theme requires as a minimum the type, field, and cat properties. The type is **categorized**. The **field** value must be a column in the PostGIS table which can be used to categorize a location. **cat** is an array like object which lists the different categories as key/value pairs. The key is used to identify the category of a location while the value defines the styling of the marker as well as the label which should be shown in the legend.

`"other": true`

The other entry will show a marker for values which do not match a category key in the theme's legend.

![](../../../assets/img/cluster_layer_3.png)

Entries \(label\) in the categorized theme legend can be used to filter the respective category.

![](../../../assets/img/cluster_layer_4.png)

### **Graduated cluster theme**

Cluster fall into a graduated theme category when their aggregated value is larger then the categories key \(parsed\) but smaller than the subsequent category's key \(parsed\).

```javascript
"Households": {
  "type": "graduated",
  "field": "hhdooc_11",
  "cat": {
      "0": {
          "label": "0 to 100",
          "fillColor": "#15773f"
      },
      "100": {
          "label": "100 to 250",
          "fillColor": "#66bd63"
      },
      "250": {
          "label": "250 to 500",
          "fillColor": "#a6d96a"
      },
      "500": {
          "label": "500 to 1000",
          "fillColor": "#d9ef8b"
      },
      "1000": {
          "label": "1000 to 2500",
          "fillColor": "#fdae61"
      },
      "2500": {
          "label": "2500 to 5000",
          "fillColor": "#f46d43"
      },
      "5000": {
          "label": "5000 or more",
          "fillColor": "#d73027"
      }
  }
```

Graduated categories can not be filtered from the legend.

### Competition Theme

Competition themes allow to show the makeup of locations aggregated in individual cluster.

```javascript
"Tesco/Sainsbury's": {
  "type": "competition",
  "field": "retailer",
  "other": true,
  "cat": {
      "Tesco": {
          "label": "Tesco",
          "fillColor": "#0055a8"
      },
      "Sainsburys": {
          "label": "Sainsbury's",
          "fillColor": "#ee8a00"
      }
  }
}
```

The size of the competition layers in marker are defined by their respective size. A single colour cluster marker indicates that the whole cluster is made up of the same category. A cluster split 50/50 between two categories will have a base colour of one category and a target disc with a radius of 0.5 the size of the cluster to represent the second category.

The legend can be used to filter individual competition categories.

## Cluster size

By default cluster will be sized according to their count. The marker for a cluster with three locations will be bigger than a marker for a cluster with 2 locations. The size is linear to the size of the cluster with the highest count of locations.

It is possible to set the minimum and maximum size for cluster locations in the cluster panel.

It is also possible to use a log scale instead of a linear scale to size cluster in relation to the largest cluster in the view.


### Cluster size in themes

It is possible to define a size entry themes.

```text
"Households": {
  "type": "graduated",
  "field": "hhdooc_11",
  "size": "hhdooc_11",
  "cat": {...}
}
```

The aggregated cluster value from the size field will then be used to determine the relative size of cluster.