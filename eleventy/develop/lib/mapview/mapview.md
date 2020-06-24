---
title: Mapview
tags: [develop]
layout: root.html
orderPath: /develop/lib/mapview/_mapview
---

# Mapview

Mapview methods relate to the Openlayers map object.

## .create(params)

Will create an Openlayers map object will be assigned to _xyz.map. Params provided to the Mapview create method will be assigned to the locale object. It is therefore possible to override the initial view, bounds, and other locale entries for a mapview.

Layers with display as true in the layers.list will be immediately added to the map and shown.

A **changeEnd** event listener will update the viewport URL hooks if enabled and check the layers list. Layers which should be displayed at the current zoom level at the end of a map view change event will be reloaded. The changeEnd event will be called after the map view changes due to panning or a change of zoom level. Interactions will be disabled at the beginning of a map view change event.

### view

A view will be set to lng, lat, and z defined as a view object. The view object will be created from the current viewport hooks if enabled.

### bounds

The extent of the map view will be limited to the west, south, east, and north defined in a bounds object.

### maskBounds

The area which falls outside the bounds will be masked if set as true.

### minZoom, maxZoom

If set the map view will be limited to these zoom levels.

### srid 

The map view projection. Defaults to EPSG:3857 if not explicitly set.

### mouseWheelZoom

Allows for pinch and mousewheel zoom if set as true.

### showScaleBar

A scalebar will be displayed within the map container if set as true.


## .getBounds()

Returns the current bounds of the map view.


## .flyTo(extent, params)

Set the map view to the provided extent with an animation for the change between views.