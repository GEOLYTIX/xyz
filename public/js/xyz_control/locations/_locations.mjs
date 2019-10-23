import select from './select.mjs';

import selectCallback from './selectCallback.mjs';

import draw from './draw.mjs';

import listview from './listview.mjs';

import remove from './remove.mjs';

import flyTo from './flyTo.mjs';

import update from './update.mjs';

import trash from './trash.mjs';

import clipboard from './clipboard.mjs';

import view from './view/_view.mjs';

export default _xyz => ({

  select: select(_xyz),

  selectCallback: selectCallback(_xyz),

  list: [
    {style: {strokeColor: '#9c27b0'}}
  ],

  listview: listview(_xyz),

  custom: {},

  decorate: (location, assign = {}) => {

    return Object.assign(
      location,
      {
        remove: remove(_xyz),
        
        flyTo: flyTo(_xyz),
        
        update: update(_xyz),

        trash: trash(_xyz),

        clipboard: clipboard(_xyz),
      
        view: view(_xyz),

        draw: draw(_xyz),
          
        geometries: [],
        
        tables: [],
        
        style: Object.assign({
          strokeColor: '#1F964D',
          // icon: {
          //   url: _xyz.utils.svg_symbols({
          //     type: 'circle',
          //     style: {
          //       color: '#090'
          //     }
          //   }),
          //   size: 40
          // }
        }, location.style || {})
      },
      assign);

  },

});