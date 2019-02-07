// use leaflet map control
import _XYZ from './xyz_leaflet/index.mjs';

const _xyz = _XYZ();

_xyz.log = typeof document.body.dataset.log !== 'undefined';

_xyz.nanoid = document.body.dataset.nanoid;

_xyz.view.mode = document.body.dataset.viewmode;

// Set platform specific interface functions.
import mobile from './views/mobile.mjs';
if (_xyz.view.mode === 'mobile') mobile(_xyz);

import desktop from './views/desktop.mjs';
if (_xyz.view.mode === 'desktop') desktop(_xyz);

import hooks from './hooks.mjs';
hooks(_xyz);

import locales from './locales.mjs';

import _layers from './layer/_layers.mjs';
_layers(_xyz);

import _locations from './location/_locations.mjs';
_locations(_xyz);

import gazetteer from './gazetteer.mjs';
gazetteer(_xyz);

// Initiate map control.
_xyz.init({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  callback: init
});

function init(_xyz) {

  _xyz.mapview.create({
    target: document.getElementById('Map'),
    scrollWheelZoom: true,
    btn: {
      ZoomIn: document.getElementById('btnZoomIn'),
      ZoomOut: document.getElementById('btnZoomOut'),
      Locate: document.getElementById('btnLocate')
    }
  });

  // Create locales dropdown (if more than one locale in workspace).
  locales(_xyz);

  // Initialize layers.
  _xyz.layers.init();

  // Initialize locations module.
  _xyz.locations.init();

  // Init gazetteer.
  _xyz.gazetteer.init();

  // Init tableview
  if(_xyz.view.mode === 'desktop') _xyz.tableview.init();

  if (_xyz.log) console.log(_xyz);

}