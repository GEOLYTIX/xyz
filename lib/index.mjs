import * as utils from './utils/_utils.mjs';

import workspace from './workspace.mjs';

import hooks from './hooks.mjs';

import mapview from './mapview/_mapview.mjs';

import layers from './layers/_layers.mjs';

import locations from './locations/_locations.mjs';

import query from './query.mjs';

import dataviews from './dataviews/_dataviews.mjs';

import gazetteer from './gazetteer.mjs';

function _xyz(params = {}) {

  const _xyz = Object.assign({
    version: XYZ_VERSION,
    defaults: {
      colours: [
        { hex: '#c62828', name: 'Fire Engine Red' },
        { hex: '#f50057', name: 'Folly' },
        { hex: '#9c27b0', name: 'Dark Orchid' },
        { hex: '#673ab7', name: 'Plump Purple' },
        { hex: '#3f51b5', name: 'Violet Blue' },
        { hex: '#2196f3', name: 'Dodger Blue' },
        { hex: '#03a9f4', name: 'Vivid Cerulean' },
        { hex: '#00bcd4', name: 'Turquoise Surf' },
        { hex: '#009688', name: 'Dark Cyan' },
        { hex: '#4caf50', name: 'Middle Green' },
        { hex: '#8bc34a', name: 'Dollar Bill' },
        { hex: '#cddc39', name: 'Pear' },
        { hex: '#ffeb3b', name: 'Banana Yellow' },
        { hex: '#ffb300', name: 'UCLA Gold' },
        { hex: '#fb8c00', name: 'Dark Orange' },
        { hex: '#f4511e', name: 'Orioles Orange' },
        { hex: '#8d6e63', name: 'Dark Chestnut' },
        { hex: '#777777', name: 'Sonic Silver' },
        { hex: '#bdbdbd', name: 'X11 Gray' },
        { hex: '#aaaaaa', name: 'Dark Medium Gray' },
        { hex: '#78909c', name: 'Light Slate Gray' }
      ]
    },
    locale: {},
    utils: utils
  }, params);

  _xyz.workspace = workspace(_xyz);

  _xyz.hooks = hooks(_xyz);

  _xyz.mapview = mapview(_xyz);

  _xyz.layers = layers(_xyz);

  _xyz.locations = locations(_xyz);

  _xyz.gazetteer = gazetteer(_xyz);

  _xyz.query = query(_xyz);

  _xyz.dataviews = dataviews(_xyz);

  params.callback && getLocale(_xyz)

  return _xyz;
};

window._xyz = _xyz;

export default _xyz;

function getLocale(xyz) {

  if (!xyz.locale) return console.log('No locale defined for callback')

  xyz.workspace.get.locale({
    locale: xyz.locale
  }).then(locale => {
    xyz.locale = locale
    getLayers(xyz)
  })

}

function getLayers(xyz) {

  const layerPromises = xyz.locale.layers.map(layer => {

    return xyz.workspace.get.layer({
      locale: xyz.locale.key,
      layer: layer
    })
  })

  Promise.all(layerPromises).then(layers => {

    layers
      .filter(layer => !!layer.format)
      .forEach(layer => {

      xyz.layers.list[layer.key] = xyz.layers.decorate(layer)

    })

    xyz.callback(xyz)

  })

}