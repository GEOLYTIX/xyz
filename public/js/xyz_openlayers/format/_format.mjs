import mvt from './mvt.mjs';

import geojson from './geojson.mjs';

import cluster from './cluster.mjs';

import tiles from './tiles.mjs';

import grid from './grid.mjs';

import select from './select.mjs';

import selectCluster from './selectCluster.mjs';

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

  if (layer.format === 'grid') {
    layer.grid_size = layer.grid_size || Object.values(layer.grid_fields)[0];
    layer.grid_color = layer.grid_color || Object.values(layer.grid_fields)[0];
    layer.grid_ratio = layer.grid_ratio || false;
  }

  if (layer.format === 'cluster') {
    layer.highlight = true;
    layer.select = selectCluster(_xyz);
  }

  //layer.get = formats[layer.format](layer);
  formats[layer.format](layer);

};