import _xyz from '../_xyz.mjs';

import format_mvt from './format/mvt.mjs';

import format_cluster from './format/cluster.mjs';

import format_tiles from './format/tiles.mjs';

export default layer => {

  if (!layer.format) return;

  if (!layer.key) return;

  _xyz.map.createPane(layer.key);
  _xyz.map.getPane(layer.key).style.zIndex = 500 + Object.keys(_xyz.layers).length;
    
  if (layer.format === 'mvt') layer.get = format_mvt;

  if (layer.format === 'cluster') layer.get = format_cluster;

  if (layer.format === 'tiles') layer.get = format_tiles;

  layer.get();

  _xyz.layers[layer.key] = layer;

};