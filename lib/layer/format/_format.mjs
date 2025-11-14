/**
## /layer/formats
The formats module exports an object with layer formats method required to decorate a mapp layer object.

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
