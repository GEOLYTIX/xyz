import _xyz from '../_xyz.mjs';

import L from 'leaflet';

_xyz.L = L;

import getWorkspace from './src/getWorkspace.mjs';

_xyz.getWorkspace = getWorkspace;

import add from './src/layer/add.mjs';

_xyz.layers.add = add;

import init from './src/init.mjs';

_xyz.init = init;



export default _xyz;