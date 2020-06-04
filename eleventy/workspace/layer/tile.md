---
title: Tile Layer
tags: [workspace]
layout: root.html
---

# Tiles layer

Raster tile layers maybe requested from any provider which supports the OSM tile layer format. The source of the tile layer must be defined in the layers' URI value.

`"URI": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`

The z, x, and y parameter will be substituted by the XYZ Library.

`/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?&provider=MAPBOX&host=https://api.mapbox.com`

Setting a provider and host will substitute the host param as well as the API key when the request is passed through the XYZ API.