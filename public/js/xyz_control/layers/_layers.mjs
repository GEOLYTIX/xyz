import layer from './layer.mjs';

import listview from './listview.mjs';

export default _xyz => ({

  layer: layer(_xyz),

  list: {},

  listview: listview(_xyz),

});