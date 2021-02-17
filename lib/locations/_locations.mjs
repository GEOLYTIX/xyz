import select from './select.mjs';

import selectCallback from './selectCallback.mjs';

import view from './view/_view.mjs';

import listview from './listview.mjs';

import draw from './draw.mjs';

import remove from './remove.mjs';

import flyTo from './flyTo.mjs';

import update from './update.mjs';

import trash from './trash.mjs';

export default _xyz => {

  const locations = {

    decorate: decorate,

    list: [
      {
        style: { strokeColor: '#9c27b0' },
        colorFilter: 'invert(22%) sepia(80%) saturate(1933%) hue-rotate(272deg) brightness(97%) contrast(104%)'
      }
    ],

    plugins: {},

    view: view(_xyz),

    listview: listview(_xyz),

    select: select(_xyz),

    selectCallback: selectCallback(_xyz),

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

        tabs: new Set(),

        geometryCollection: [],

        style: Object.assign({
            strokeColor: '#1F964D'
          },
          location.style || {})

      },
      assign)

  }

}