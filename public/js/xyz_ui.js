import _xyz from './xyz_control/index.mjs';

import logRocket from './logRocket.mjs';

import mobile from '../views/mobile.mjs';

import desktop from '../views/desktop.mjs';

import hooks from './hooks.mjs';

import locales from './locales.mjs';

import layerlistview from './layer/listview.mjs';

import locationlistview from './location/listview.mjs';

import gazetteer from './gazetteer.mjs';

_xyz({
  host: document.head.dataset.dir || new String(''),
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

  const btnWorkspace = document.getElementById('btnWorkspace');
  if (btnWorkspace) btnWorkspace.onclick = () => {
    _xyz.workspace.admin();
  };

  // Initialize layers.
  _xyz.layers.listview = layerlistview(_xyz);

  // Initialize location listview.
  _xyz.locations.listview = locationlistview(_xyz);

  // Init gazetteer.
  gazetteer(_xyz);

  // Compose locales load function and locales drop down.
  locales(_xyz);

  if (_xyz.log) console.log(_xyz);

  logRocket(document.body.dataset.logrocket);

}