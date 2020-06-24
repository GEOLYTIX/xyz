---
title: Interactions
tags: [develop]
layout: root.html
---

# Interactions

Interactions define map interface methods such as selecting locations from displayed layers or drawing geometries.

Only one interaction can be current at any one time.

Interactions must have begin, finish, and cancel methods.

The current interaction will be finished if another interactions begins.

The default interaction is highlight/select. If any other interaction is finished the highlight/select interaction will begin.

## draw

Params provided to the draw.begin() method define type of geometry to be drawn.

The default [geometryFunction](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw.html#~GeometryFunction) used for the construction of linestrings and polygons uses [Turf.kinks](https://www.npmjs.com/package/@turf/kinks) to check for self intersections in the sketch geometry. If true, the construction of the next vertix is prevented.