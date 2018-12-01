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

token(init);

function init() {
 
  // Set platform specific interface functions.
  if (_xyz.view.mode === 'mobile') mobile();
  if (_xyz.view.mode === 'desktop') desktop();

  // Initiate hooks module.
  hooks();

  // Initiate locales module.
  locales();

  // Initiate map control.
  map();

  // Initialize layers.
  _xyz.layers.init = _layers;
  _xyz.layers.init();

  // Initialize locations module.
  _xyz.locations.init = _locations;
  _xyz.locations.init();

  // Initialize gazetteer module.
  gazetteer();

  // Initialize locate module.
  if (_xyz.ws.locate) locate();

  // Add redirect to login button click event.
  document.getElementById('btnLogin').addEventListener('click', () => {
    window.location = document.head.dataset.dir + '/login?redirect=' + (document.head.dataset.dir || '/') + window.location.search;
  });

  if (_xyz.log) console.log(_xyz);

}