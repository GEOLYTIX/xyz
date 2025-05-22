/**
### mapp.layer.formats{}
The format function matching the layer's format key decorate the layer object with methods to load and style tiles and features.

@module /layer/formats
*/

/**
@function mbtiles
@deprecated

@description
The mbtiles layer format method has been deprecated.
*/
function mbtiles() {
  console.warn(
    `The mbtiles layer format method has been deprecated. Please use maplibre format instead.`,
  );
}

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
  mbtiles,
  mvt,
  tiles,
  vector,
  wkt: vector,
};
