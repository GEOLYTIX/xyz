import _xyz_instance from '../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

import * as utils from '../utils/_utils.mjs';

import assignBtn from './src/assignBtn.mjs';

import workspace from './src/workspace.mjs';

import attribution from './src/attribution.mjs';

import _layer from './src/layer/_layer.mjs';

import _location from './src/location/_location.mjs';

import _tableview from '../tableview/_tableview.mjs';

import mapview from './src/mapview.mjs';

import _draw from './src/draw/_draw.mjs';

import loadLocale from './src/loadLocale.mjs';

import locate from './src/locate.mjs';

import init from './src/init.mjs';

export default () => {
    
  const _xyz = _xyz_instance();

  _xyz.L = L;

  _xyz.utils = utils;

  assignBtn(_xyz);

  attribution(_xyz);

  workspace(_xyz);

  _layer(_xyz);

  _location(_xyz);
  
  _tableview(_xyz);

  mapview(_xyz);

  _draw(_xyz);

  loadLocale(_xyz);

  locate(_xyz);

  init(_xyz);

  return _xyz;

};