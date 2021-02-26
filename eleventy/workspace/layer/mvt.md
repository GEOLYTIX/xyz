---
title: MVT

layout: root.html
---

# MVT layer

MVT layer are vector layers which read the geometry column from a PostGIS table. The XYZ backend splits the map view into tiles and compresses the geometry as well as properties into the vector tile PBF format using the [MapBox Vector Tile specification](https://www.mapbox.com/vector-tiles/specification).

## MVT cache

Tile caches need to be truncated if the list of attribute fields changes.

It is possible to enable the caching backend rendered MVT thus reducing the response time when accessing accessing cached tiles.

`"mvt_cache": "{tablename}__mvts"`

The cache table will be generated during the workspace load sequence. Cached tiles contain a list of table fields. The cache table will be truncated (during workspace load sequence) if the list is changed to include fields which were not previously contained in cached tiles.