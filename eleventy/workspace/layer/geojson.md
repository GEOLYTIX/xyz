---
title: GeoJson
tags: [workspace]
layout: root.html
---

# GeoJSON layer

GeoJSON layer are vector layers which read the geometry column from a PostGIS table. Geometries are transformed into the [GeoJSON format](http://geojson.org) which is fairly verbose and may require a lot of bandwidth to transfer complex geometries to the client.