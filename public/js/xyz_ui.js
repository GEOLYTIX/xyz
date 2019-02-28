// use leaflet map control
import _xyz from './xyz_control/index.mjs';

import mobile from './views/mobile.mjs';

import desktop from './views/desktop.mjs';

import hooks from './hooks.mjs';

import locales from './locales.mjs';

import layerlistview from './layer/listview.mjs';

import locationlistview from './location/listview.mjs';

import gazetteer from './gazetteer.mjs';

_xyz({
  host: document.head.dataset.dir,
  token: document.body.dataset.token,
  log: document.body.dataset.log,
  nanoid: document.body.dataset.nanoid,
  callback: init,
});

function init(_xyz) {

  _xyz.hooks = hooks(_xyz);

  // Set platform specific interface functions.
  if (document.body.dataset.viewmode === 'mobile') mobile(_xyz);
  if (document.body.dataset.viewmode === 'desktop') desktop(_xyz);

  // _xyz.hooks = hooks(_xyz);

  // Create mapview control.
  _xyz.mapview.create({
    target: document.getElementById('Map'),
    locale: _xyz.hooks.current.locale,
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z,
    },
    scrollWheelZoom: true,
    btn: {
      ZoomIn: document.getElementById('btnZoomIn'),
      ZoomOut: document.getElementById('btnZoomOut'),
      Locate: document.getElementById('btnLocate'),
    }
  });

  // Create tableview control.
  _xyz.tableview.create({
    target: document.getElementById('tableview'),
    btn: {
      toggleTableview: document.getElementById('toggleTableview')
    }
  });

  // Create locales dropdown (if more than one locale in workspace).
  locales(_xyz);

  // Initialize layers.
  _xyz.layers.listview = layerlistview(_xyz);
  _xyz.layers.listview.init();

  // Initialize location listview.
  _xyz.locations.listview = locationlistview(_xyz);
  _xyz.locations.listview.init();

  // Init gazetteer.
  gazetteer(_xyz);
  _xyz.gazetteer.init();

  if (_xyz.log) console.log(_xyz);

}