import _xyz from './_xyz.mjs';

// Set platform specific interface functions.
import mobile from './views/mobile.mjs';
if (_xyz.view.mode === 'mobile') mobile();

import desktop from './views/desktop.mjs';
if (_xyz.view.mode === 'desktop') desktop();

import './hooks.mjs';

import './locales.mjs';

// use leaflet map control
import './xyz_leaflet/index.mjs';

import './layer/_layers.mjs';

import './location/_locations.mjs';

import gazetteer from './gazetteer.mjs';

import locate from './locate.mjs';


// Initiate map control.
_xyz.init({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  map_id: 'Map',
  next: init
});

function init() {

  // Create locales dropdown (if more than one locale in workspace).
  _xyz.locales(_xyz.ws.locales);

  // Initialize layers.
  _xyz.layers.init();

  // Initialize locations module.
  _xyz.locations.init();

  // Initialize gazetteer module.
  gazetteer();

  // Initialize locate module.
  if (_xyz.ws.locate) locate();

  if (_xyz.log) console.log(_xyz);

}