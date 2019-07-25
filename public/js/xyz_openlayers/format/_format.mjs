import mvt from './mvt.mjs';

import geojson from './geojson.mjs';

import cluster from './cluster.mjs';

import tiles from './tiles.mjs';

import grid from './grid.mjs';

import select from './select.mjs';

export default _xyz => layer => {

  const formats = {

    mvt: mvt(_xyz),

    geojson: geojson(_xyz),
  
    cluster: cluster(_xyz),
  
    tiles: tiles(_xyz),
  
    grid: grid(_xyz),

  };

  if (layer.format === 'mvt') {
    layer.highlight = true;
    layer.select = select(_xyz);
  }

  if (layer.format === 'geojson') {
    layer.highlight = true;
    layer.select = select(_xyz);
  }

  layer.get = formats[layer.format](layer);

};