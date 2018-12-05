import _xyz from './src/_xyz.mjs';

import L from 'leaflet';

_xyz.L = L;

import getWorkspace from './src/getWorkspace.mjs';

_xyz.getWorkspace = getWorkspace;

import addLayer from './src/layer/addLayer.mjs';

_xyz.addLayer = addLayer;

import loadLocale from './src/loadLocale.mjs';

_xyz.loadLocale = loadLocale;

import init from './src/init.mjs';

_xyz.init = init;



export default _xyz;