---
title: Locations

layout: root.html
---

# Locations

The _xyz.locations object provides methods to create (decorate) new location objects.

Locations may either be manualy created or be selected from a layer. The layers infoj object describes the schema for all locations that make up a layer. The locations.select method will request a location's geometry and properties from the XYZ Location API. The information returned from the API fill be passed into the locations.selectCallback which will create a new location and the location to the locations.list.

The locations.list is an array of object with each object being one location. All of the locations methods can be accessed through the object in the locations.list. Removing a location by invoking the remove function will clear the location from this list.

The locations.view factory will create a DOM element with control elements linked to the locations' methods.

The locations.listview will assign a DOM element to be a list of all the selected locations' views.