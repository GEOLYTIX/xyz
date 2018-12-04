import _xyz from '../_xyz.mjs';

import format_mvt from './format/mvt.mjs';

import format_tiles from './format/tiles.mjs';

export default layer => {

  if (!layer.format) return;
    
  if (layer.format === 'mvt') layer.get = format_mvt;

  if (layer.format === 'tiles') layer.get = format_tiles;

  layer.get();

  _xyz.layers[layer.key] = layer;

};