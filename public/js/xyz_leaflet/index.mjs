import _xyz_instance from '../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

import * as utils from '../utils/_utils.mjs';

import init from './src/init.mjs';

export default () => {
    
  const _xyz = _xyz_instance();

  _xyz.L = L;

  _xyz.utils = utils;

  init(_xyz);

  return _xyz;

};