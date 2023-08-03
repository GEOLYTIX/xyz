import mbtiles from './mbtiles.mjs'

import maplibre from './maplibre.mjs'

import tiles from './tiles.mjs'

import mvt from './mvt.mjs'

import cluster from './cluster.mjs'

import vector from './vector.mjs'

import grid from './grid.mjs'

export default {
  mbtiles,
  maplibre,
  tiles,
  mvt,
  cluster,
  geojson: vector,
  wkt: vector,
  grid
}