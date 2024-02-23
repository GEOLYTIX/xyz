/**

### layer/formats
The format function matching the layer's format key decorate the layer object with methods to load and style tiles and features.

@object layer/formats
@memberof module:layer

*/

import mbtiles from './mbtiles.mjs'

import maplibre from './maplibre.mjs'

import tiles from './tiles.mjs'

import mvt from './mvt.mjs'

import vector from './vector.mjs'

export default {
  mbtiles,
  maplibre,
  tiles,
  mvt,
  cluster: vector,
  geojson: vector,
  wkt: vector,
  vector
}