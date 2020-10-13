import select from './select.mjs';

import selectCallback from './selectCallback.mjs';

import view from './view/_view.mjs';

import listview from './listview.mjs';

import draw from './draw.mjs';

import remove from './remove.mjs';

import flyTo from './flyTo.mjs';

import update from './update.mjs';

import trash from './trash.mjs';

//import clipboard from './clipboard.mjs';

export default _xyz => {

  const locations = {

    select: select(_xyz),

    selectCallback: selectCallback(_xyz),

    list: [
      {
        style: { strokeColor: '#9c27b0' },
        colorFilter: 'invert(22%) sepia(80%) saturate(1933%) hue-rotate(272deg) brightness(97%) contrast(104%)'
      }
    ],

    view: view(_xyz),

    listview: listview(_xyz),

    plugins: {},

    decorate: decorate,

  }

  return locations;

  
  function decorate(location, assign = {}) {

    Object.assign(
      location,
      {
        remove: remove(_xyz),

        trash: trash(_xyz),

        flyTo: flyTo(_xyz),

        update: update(_xyz),

        draw: draw(_xyz),

        geometries: [],

        tables: [],

        tabviews: [],

        geometryCollection: [],

        style: Object.assign({
          strokeColor: '#1F964D',
          // icon: {
          //   url: _xyz.utils.svg_symbols({
          //     type: 'circle',
          //     style: {
          //       color: '#1F964D'
          //     }
          //   }),
          //   size: 40
          // }
        }, location.style || {})
      },
      assign);

  }

}