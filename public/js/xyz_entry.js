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
locales(_xyz);

import _layers from './layer/_layers.mjs';
_layers(_xyz);

import _locations from './location/_locations.mjs';
_locations(_xyz);

import gazetteer from './gazetteer.mjs';
gazetteer(_xyz);

import _tableview from './tableview/_tableview.mjs';
_tableview(_xyz);

// Initiate map control.
_xyz.init({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  map_id: 'Map',
  scrollWheelZoom: true,
  btnZoomIn: document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnLocate: document.getElementById('btnLocate'),
  callback: init
});

function init() {

  // Create locales dropdown (if more than one locale in workspace).
  _xyz.locales(_xyz.ws.locales);

  // Initialize layers.
  _xyz.layers.init();

  // Initialize locations module.
  _xyz.locations.init();

  // Init gazetteer.
  _xyz.gazetteer.init();

  // Init tableview
  if(_xyz.view.mode === 'desktop') _xyz.tableview.init();
  //console.log(_xyz.layers.list);

  if (_xyz.log) console.log(_xyz);

}