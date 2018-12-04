import _xyz from './src/_xyz.mjs';

import L from 'leaflet';

_xyz.L = L;

import init from './src/init.mjs';

_xyz.init = init;

import addLayer from './src/layer/addLayer.mjs';

_xyz.addLayer = addLayer;

export default _xyz;