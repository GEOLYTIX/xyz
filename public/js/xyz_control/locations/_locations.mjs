import location from './location.mjs';

import select from './select.mjs';

import listview from './listview.mjs';

export default _xyz => ({

  select: select(_xyz),

  location: location(_xyz),

  listview: listview(_xyz),

});