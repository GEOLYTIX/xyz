import select from './select.mjs';

import selectCallback from './selectCallback.mjs';

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
    {
      style: {
        color: _xyz.utils.chroma('hotpink')
      },
    }
  ],

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
          
        geometries: [],
        
        tables: [],
        
        style: Object.assign({
          color: '#090',
          stroke: true,
          fill: true,
          fillOpacity: 0,
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

  listview: listview(_xyz),

});