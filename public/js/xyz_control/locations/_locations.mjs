import select from './select.mjs';

import listview from './listview.mjs';

import remove from './remove.mjs';

import draw from './draw.mjs';

import flyTo from './flyTo.mjs';

import update from './update.mjs';

import view from './view/_view.mjs';

export default _xyz => ({

  select: select(_xyz),

  list: [
    {
      style: {
        color: _xyz.utils.chroma('hotpink')
      },
      stamp: parseInt(Date.now()),
    }
  ],

  decorate: (location, assign = {}) => {

    return Object.assign(
      location,
      {
        remove: remove(_xyz),
  
        draw: draw(_xyz),
        
        flyTo: flyTo(_xyz),
        
        update: update(_xyz),
      
        view: view(_xyz),
          
        geometries: [],
        
        tables: [],
        
        style: Object.assign({
          color: '#090',
          stroke: true,
          fill: true,
          fillOpacity: 0,
          icon: {
            url: _xyz.utils.svg_symbols({
              type: 'circle',
              style: {
                color: '#090'
              }
            }),
            size: 40
          }
        }, location.style || {})
      },
      assign);

  },

  listview: listview(_xyz),

});