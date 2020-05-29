---
title: Tile Layer
tags: [configure]
layout: root.html
---

Base layer are raster tile layers which are primarily consumed from 3rd party mapping providers.

`"URI": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`

The URI is the only additional parameter which is required to add a raster tiles layer.

`https://.../{z}/{x}/{y}/256/png8?&provider=HERE`

By adding a provider tag to the end of the URI string value the request will be proxied through the XYZ backend where the tag will be replaced with the matching provider key from the  environment settings.

We recommend to split labels to a separate set of transparent raster tiles and add these last to the layers object in order for the data layers to be sandwiched between the base tiles and the labels drawn on top.