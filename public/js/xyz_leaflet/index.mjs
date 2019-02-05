import _xyz_instance from '../_xyz.mjs';

import L from 'leaflet';

import 'leaflet.vectorgrid';

import * as utils from '../utils/_utils.mjs';



import init from './src/init.mjs';



import layer from './src/layer/_layer.mjs';

import location from './src/location/_location.mjs';

import mapview from './src/mapview/_mapview.mjs';

import tableview from '../tableview/_tableview.mjs';

export default () => {
    
  const _xyz = _xyz_instance();

  _xyz.L = L;

  _xyz.utils = utils;

  init(_xyz);

 

  layer(_xyz);

  location(_xyz);

  mapview(_xyz);

  tableview(_xyz);



  return _xyz;

};