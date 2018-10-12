import _xyz from './_xyz.mjs';

import token from './token.mjs';

import mobile from './views/mobile.mjs';

import desktop from './views/desktop.mjs';

import hooks from './hooks.mjs';

import locales from './locales.mjs';

import map from './map.mjs';

import _layers from './layer/_layers.mjs';

import _locations from './location/_locations.mjs';

import gazetteer from './gazetteer.mjs';

import locate from './locate.mjs';

_xyz.log = typeof document.body.dataset.log !== 'undefined';
_xyz.nanoid = document.body.dataset.nanoid;
_xyz.view_mode = document.body.dataset.viewmode;
_xyz.host = document.head.dataset.dir;

token(init);

function init() {
 
  // Set platform specific interface functions.
  if (_xyz.view_mode === 'mobile') mobile();
  if (_xyz.view_mode === 'desktop') desktop();

  // Initiate hooks module.
  hooks();

  // Initiate locales module.
  locales();

  // Initiate map control.
  map();

  // Initialize layers.
  _xyz.initLayers = _layers;
  _xyz.initLayers();

  // Initialize locations module.
  _xyz.initLocations = _locations;
  _xyz.initLocations();

  // Initialize gazetteer module.
  if (_xyz.view_mode !== 'report') gazetteer();

  // Initialize locate module.
  if (_xyz.ws.locate && _xyz.view_mode !== 'report') locate();

  // Initialize report module.
  // if (_xyz.ws.report) report();

  // Add redirect to login button click event.
  document.getElementById('btnLogin').addEventListener('click', () => {
    window.location = document.head.dataset.dir + '/login?redirect=' + (document.head.dataset.dir || '/') + window.location.search;
  });

  console.log(_xyz);

}