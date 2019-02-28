import _xyz_instance from '../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

import * as utils from '../utils/_utils.mjs';

import workspace from '../workspace.mjs';

import layers from './layers/_layers.mjs';

import locations from './locations/_locations.mjs';

import mapview from '../xyz_leaflet/mapview/_mapview.mjs';

import tableview from './tableview/_tableview.mjs';

export default async (params) => {
    
  const _xyz = _xyz_instance();

  _xyz.L = L;

  _xyz.utils = utils;

  _xyz.layers = layers(_xyz);

  _xyz.locations = locations(_xyz);

  _xyz.mapview = mapview(_xyz);

  _xyz.tableview = tableview(_xyz);

  _xyz.workspace = workspace(_xyz);

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

  _xyz.workspace.loadLocale(params);

  return _xyz;

};