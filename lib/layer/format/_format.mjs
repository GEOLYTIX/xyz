/**
### mapp.layer.formats{}
The format function matching the layer's format key decorate the layer object with methods to load and style tiles and features.

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
