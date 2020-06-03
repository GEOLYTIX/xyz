---
title: Layers
tags: [develop]
layout: root.html
---

# Layers

The _xyz.layers object provides methods to create (decorate) new layer objects. All currently loaded layers are stored in the _xyz.layers.list.

The layers list is an object with all keys being individual layers.

The layers.view factory will create a DOM element with control elements linked to the layers' methods.

The layers.listview will assign a DOM element to be a list of all the layers' views.