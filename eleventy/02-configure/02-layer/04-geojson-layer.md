---
title: GeoJson Layer
tags: [configure]
layout: root.html
---

GeoJSON layer are vector layers which read the geometry column from a PostGIS table. Geometries are transformed into the [GeoJSON format](http://geojson.org) which is fairly verbose and may require a lot of bandwidth to transfer complex geometries to the client.

We recommend to use the MapBox Vector Tile \(MVT\) format for layers with many and/or complex geometries.

### **GeoJSON geometry**

`"geom": "geom"`

GeoJSON layer require a PostGIS geometry column of the type GEOMETRY\(POLYGON,4326\) or GEOMETRY\(MULTIPOLYGON,4326\). By default the geom value will be set to 'geom'.

## **GeoJSON locations**

`"qID": "optional"`

Setting the **qID** as a valid id column for the database table will make vector locations selectable. There is no default for the qID value. The qID value together with the table and dbs parameter will be tested during the workspace load.

Additional parameter will be discussed in the locations section of this document.