import _xyz_instance from '../xyz_control/_xyz.mjs';

import * as _utils from '../utils/_utils.mjs';

import workspace from '../xyz_control/workspace.mjs';

import hooks from '../xyz_control/hooks.mjs';

import _gazetteer from '../xyz_control/gazetteer/_gazetteer.mjs';

import _layers from '../xyz_control/layers/_layers.mjs';

import _format from './layer/_format.mjs';

import _locations from '../xyz_control/locations/_locations.mjs';

import _geom from '../xyz_control/geom/_geom.mjs';

import _tableview from '../xyz_control/tableview/_tableview.mjs';

import lib from './lib.mjs';

import _mapview from './mapview/_mapview.mjs';



async function _xyz(params) {
    
  const _xyz = _xyz_instance();

  _xyz.utils = _utils;

  _xyz.mapview = { lib: lib() };

  Object.assign(_xyz.mapview, _mapview(_xyz));

  _xyz.layers = Object.assign({}, _layers(_xyz), {format: _format(_xyz)});

  _xyz.locations = _locations(_xyz);

  _xyz.geom = _geom(_xyz);

  _xyz.tableview = _tableview(_xyz);

  _xyz.workspace = workspace(_xyz);

  if (params.hooks) hooks(_xyz);

  _xyz.gazetteer = _gazetteer(_xyz);

  _xyz.host = params.host;

  if (!_xyz.host) return console.error('XYZ host not defined!');

  _xyz.nanoid = params.nanoid;

  _xyz.log = (params.log && params.log === 'true');
  
  if (params.token) _xyz.token = params.token;

  // Get workspace from XYZ host.
  // Proceed with init from callback.
  if (params.callback) return _xyz.workspace.setWS(params);

  // Fetch workspace if no callback is provided.
  await _xyz.workspace.fetchWS();

  if (params.locale) _xyz.workspace.loadLocale(params);

  return _xyz;

};

window._xyz = _xyz;

export default _xyz;