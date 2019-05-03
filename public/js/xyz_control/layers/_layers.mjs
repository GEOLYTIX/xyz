import layer from './layer/_layer.mjs';

import listview from './listview.mjs';

import hover from './hover.mjs';

import format from './format/_format.mjs';

export default _xyz => ({

  layer: layer(_xyz),

  list: {},

  listview: listview(_xyz),

  hover: hover(_xyz),

  format: format(_xyz),

});