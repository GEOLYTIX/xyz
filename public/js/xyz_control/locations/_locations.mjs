import decorate from './decorate.mjs';

import select from './select.mjs';

import listview from './listview.mjs';

export default _xyz => ({

  select: select(_xyz),

  decorate: decorate(_xyz),

  list: [
    {
      style: {
        color: _xyz.utils.chroma('hotpink')
      },
      stamp: parseInt(Date.now()),
    }
  ],

  listview: listview(_xyz),

});