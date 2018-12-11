import _xyz from '../../_xyz.mjs';

import './layer/add.mjs';

_xyz.loadLocale = locale => {

  // Filter invalid layers
  _xyz.layers.list = Object.keys(locale.layers)
    .filter(key => key.indexOf('__') === -1)
    .reduce((obj, key) => {
      obj[key] = locale.layers[key];
      return obj;
    }, {});

  // Set the layer display from hooks then remove layer hooks.
  if (_xyz.hooks.current.layers) Object.keys(_xyz.layers.list).forEach(layer => {
    _xyz.layers.list[layer].display = (_xyz.hooks.current.layers.indexOf(layer) > -1);
  });

  Object.values(_xyz.layers.list).forEach(layer => {

    if (layer.style && layer.style.themes) layer.style.theme = Object.values(layer.style.themes)[0];
    
    _xyz.layers.add(layer);
  });

};