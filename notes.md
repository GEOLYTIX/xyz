# 3.4.0

## Documentation

Hidden flag in layer styles configuration

Cluster style object: 

* markerMin and markerMax replaced with "size" which is now the default size of the icon

* "marker" renamed to "default"

* "markerMulti" renamed to "cluster"

* location markers now use size (in pixels) and also can use scale which defaults to 1, 1.2 for cluster, 1.3 for highlight.

* "cluster":{} marker now inherits default styling properties and these can be overridden.

* Labelling - to add count label on clusters set count: true inside style.label.

## Fixes

MVT can now be generated from tables with a different EPSG than 3857. [#307](https://github.com/GEOLYTIX/xyz/issues/307)

-- Agata's addition
Geometry query - fix. Now uses "field" instead of "key" to assign returned value.

Add "NODE_ENV": "production" back into now.json

Fix for cut symbols. [#311](https://github.com/GEOLYTIX/xyz/issues/311)

Fix for geometryFunction. Function to check for Kinks should only be applied on Polygon construction.

Gazetteer interface in mobile view.

Filter from categorised legend to fire show layer event.

Graduated theme for line mvts - now lines displayed in legend.

Tile layers now have style object and support zIndex.

Gazetteer - now supports limit of results per dataset or all searched datasets. Final array of results now sorted alphabetically.

## New

Manual creation of location additional geometries - polygon, rectangle, circle, line, freehand implemented.

Deleting location additional geometries - alert to confirm.

Editing shapes stored as additonal geometries.

Support for dynamic modules. [#316](https://github.com/GEOLYTIX/xyz/issues/316)

Current map zoom sent to API on selection along with viewport.

Manual editing of Here API isolines.

Manual editing of Mapbox API isolines.

Support for tooltips in drawing interaction. [#321](https://github.com/GEOLYTIX/xyz/issues/321)

Measure length tool added to desktop view.

Support for json entry type => "type": "json". 

Entry type "meta" removed. 

Removed entry type "title" (prev. "label").

Layer: 
    if "qID" is unset all interaction is disabled. 
    if "qID" is set and "infoj" is unset highlight and hover will work but selection will be prevented.

Don't create render method for templates with format key, ie. layer templates.

Filter getLocales for roles.

Provide token access by generating a cookie from token. [#323](https://github.com/GEOLYTIX/xyz/issues/323)

Check locales array in getLocale mapp view script. [#325](https://github.com/GEOLYTIX/xyz/issues/325)

Support multiple datasets in charts. [#327](https://github.com/GEOLYTIX/xyz/issues/327)

Update attribution logic. [#332](https://github.com/GEOLYTIX/xyz/issues/332)

Add layers.load method. [#333](https://github.com/GEOLYTIX/xyz/issues/333)

Add layer modules. [#334](https://github.com/GEOLYTIX/xyz/issues/334)

Workspace from Cloudfront. [#335](https://github.com/GEOLYTIX/xyz/issues/335)

Basic theme support [#339](https://github.com/GEOLYTIX/xyz/issues/339)

Add language support [#340](https://github.com/GEOLYTIX/xyz/issues/340)

Add layer data export as geojson [#286] https://github.com/GEOLYTIX/xyz/issues/286

Show style in header [#341](https://github.com/GEOLYTIX/xyz/issues/341)

Remove formatDate polyfill from /mod

Introduction of APPROVAL_EXPIRY environment variable [#324](https://github.com/GEOLYTIX/xyz/issues/324)

Introduction of SRC_* parameter substitution in workspace [#343](https://github.com/GEOLYTIX/xyz/issues/343)

Check for Internet Explorer in api.js

Prevent click propagation for ol-control [#328](https://github.com/GEOLYTIX/xyz/issues/328)

Replace hyperhtml with µhtml [#281](https://github.com/GEOLYTIX/xyz/issues/281)

Drilldown methodology for select [#135](https://github.com/GEOLYTIX/xyz/issues/135)

Workspace caching [#346](https://github.com/GEOLYTIX/xyz/issues/346)

Logger module [#347](https://github.com/GEOLYTIX/xyz/issues/347)

Edge caching [#348](https://github.com/GEOLYTIX/xyz/issues/348)


## vercel.json to superseed now.json

API endpoints are no longer build as individual serverless functions. api.js in the root will import other api functions from the mod directory.