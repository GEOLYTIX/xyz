import _xyz from '../_xyz.mjs';

import L from 'leaflet';

_xyz.L = L;

import init from './src/init.mjs';

init(_xyz);

export default _xyz;