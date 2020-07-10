# 3.3.2

## Documentation

Hidden flag in layer styles configuration

## Fixes

MVT can now be generated from tables with a different EPSG than 3857. [#307](https://github.com/GEOLYTIX/xyz/issues/307)

-- Agata's addition
Geometry query - fix. Now uses "field" instead of "key" to assign returned value.

Add "NODE_ENV": "production" back into now.json

## New

Manual creation of location additional geometries - polygon, rectangle, circle, line, freehand implemented.

Deleting location additional geometries - alert to confirm.

Fix for cut symbols. [#311](https://github.com/GEOLYTIX/xyz/issues/311)