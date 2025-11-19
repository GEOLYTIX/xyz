/**
## /layer/formats
The module exports as default the formats object to access the format module methods from the layer decorator.

@requires /layer/formats/googleMapTiles
@requires /layer/formats/mapboxStyle
@requires /layer/formats/maplibre
@requires /layer/formats/mvt
@requires /layer/formats/tiles
@requires /layer/formats/vector

@module /layer/formats
*/

import googleMapTiles from './googleMapTiles.mjs';
import mapboxStyle from './mapboxStyle.mjs';
import maplibre from './maplibre.mjs';
import mvt from './mvt.mjs';
import tiles from './tiles.mjs';
import vector from './vector.mjs';

export default {
  cluster: vector,
  geojson: vector,
  googleMapTiles,
  mapboxStyle,
  maplibre,
  mvt,
  tiles,
  vector,
  wkt: vector,
};
