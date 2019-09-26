import * as utils from '../utils/_utils.mjs';

import _charts from '../xyz_control/charts/_charts.mjs';

import workspace from '../xyz_control/workspace.mjs';

import hooks from '../xyz_control/hooks.mjs';

import _gazetteer from '../xyz_control/gazetteer/_gazetteer.mjs';

import _layers from '../xyz_control/layers/_layers.mjs';

import _format from './layer/_format.mjs';

import _locations from '../xyz_control/locations/_locations.mjs';

import _ctrl from '../xyz_control/ctrl/_ctrl.mjs';

import _tableview from '../xyz_control/tableview/_tableview.mjs';

import lib from './lib.mjs';

import _mapview from './mapview/_mapview.mjs';



async function _xyz(params) {

  const _xyz = Object.assign({
    version: 'XYZ v2.0.x',
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
    }
  }, params);

  _xyz.utils = utils;

  
  _xyz.charts = _charts(_xyz);

  _xyz.mapview = { lib: lib() };

  Object.assign(_xyz.mapview, _mapview(_xyz));

  _xyz.layers = Object.assign({}, _layers(_xyz), {format: _format(_xyz)});

  _xyz.locations = _locations(_xyz);

  _xyz.ctrl = _ctrl(_xyz);

  _xyz.tableview = _tableview(_xyz);

  _xyz.workspace = workspace(_xyz);

  _xyz.hooks = hooks(_xyz);

  _xyz.gazetteer = _gazetteer(_xyz);



  if (!_xyz.host) return console.error('XYZ host not defined!');

  // Get workspace from XYZ host.
  // Proceed with init from callback.
  if (_xyz.callback) return _xyz.workspace.setWS();

  // Fetch workspace if no callback is provided.
  await _xyz.workspace.fetchWS();

  if (_xyz.locale) _xyz.workspace.loadLocale();

  return _xyz;

};

window._xyz = _xyz;

export default _xyz;