import layer from './layer.mjs';

import _view from './view/_view.mjs';

import listview from './listview.mjs';

export default _xyz => ({

  layer: layer(_xyz),

  list: {},

  view: _view(_xyz),

  listview: listview(_xyz),

});