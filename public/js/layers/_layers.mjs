import view from './view/_view.mjs';

import listview from './listview.mjs';

import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import count from './count.mjs';

export default _xyz => {

  const layers = {

    decorate: decorate,

    list: {},

    view: view(_xyz),

    listview: listview(_xyz),

  }

  return layers;


  function decorate(layer) {

    const _layer = Object.assign(
      {

        tableCurrent: tableCurrent(_xyz),

        tableMin: tableMin(_xyz),

        tableMax: tableMax(_xyz),

        zoomToExtent: zoomToExtent(_xyz),

        show: show(_xyz),

        remove: remove(_xyz),

        count: count(_xyz),

      },
      layer
    )

    // Set the first theme from themes array.
    if (_layer.style && _layer.style.themes) _layer.style.theme = _layer.style.themes[Object.keys(_layer.style.themes)[0]];

    // Set the first theme from themes array.
    if (_layer.style && _layer.style.themes) _layer.style.themes[Object.keys(_layer.style.themes)[0]];

    // Initialise Openlayers source and layer.
    _xyz.mapview.layer[layer.format](_layer);

    return _layer;
  }

}