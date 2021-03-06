import view from './view/_view.mjs';

import listview from './listview.mjs';

import tableCurrent from './tableCurrent.mjs';

import tableMin from './tableMin.mjs';

import tableMax from './tableMax.mjs';

import zoomToExtent from './zoomToExtent.mjs';

import show from './show.mjs';

import remove from './remove.mjs';

import count from './count.mjs';

import bringToFront from './bringToFront.mjs';

export default _xyz => {

  const layers = {

    decorate: decorate,

    list: {},

    plugins: {},

    view: view(_xyz),

    listview: listview(_xyz),

    load: load,

  }

  return layers;


  function decorate(params) {

    const layer = Object.assign(
      {

        tableCurrent: tableCurrent(_xyz),

        tableMin: tableMin(_xyz),

        tableMax: tableMax(_xyz),

        zoomToExtent: zoomToExtent(_xyz),

        show: show(_xyz),

        remove: remove(_xyz),

        count: count(_xyz),

        bringToFront: bringToFront(_xyz),

        tabs: new Set(),

        filter: {},

      },
      params
    )

    layer.filter.current = layer.filter.current || {}

    // Set the first theme from themes array as layer.style.theme
    if (layer.style && layer.style.themes) {
      layer.style.theme = layer.style.theme || layer.style.themes[Object.keys(layer.style.themes)[0]];
    }

    // Initialise Openlayers source and layer.
    layer.format && _xyz.mapview.layer[layer.format] && _xyz.mapview.layer[layer.format](layer);

    return layer;
  }

  function load(list) {

    return new Promise((resolveAll, rejectAll) => {

      if (!_xyz.locale.layers) resolveAll()

      const promises = _xyz.locale.layers
        .filter(_layer => !list || !list.length || list.includes(_layer))
        .map(_layer => _xyz.workspace.get.layer({
            locale: _xyz.locale.key,
            layer: _layer
          })
        )

      Promise
        .all(promises)
        .then(layers => {

          if (_xyz.hooks && _xyz.hooks.current.layers.length) {
            layers.forEach(layer => {
              layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key)
            })
          }

          layers.forEach((layer, i) => {
    
            if (!layer.format) return
    
            layer = _xyz.layers.decorate(layer)
            _xyz.layers.list[layer.key] = layer
            layer.display && layer.show()

            layers[i] = layer
          })

          resolveAll(layers)
        })
        .catch(error => {
          console.error(error)
          rejectAll(error)
        });
  
    })

  }

}