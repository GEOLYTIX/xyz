/**
## MAPP/UI

The primary module for the MAPP/UI API will import other MAPP/UI modules and assign itself to the `window.ui{}` object.

The `ui{}` object will be assigned to the global `mapp{}` object if loaded prior to the execution of the ui module script.

The `ui.mjs` module is used as entry point for the esbuild process to bundle the MAPP/UI API.

@requires /ui/elements
@requires /ui/locations
@requires /ui/layers
@requires /ui/utils

@module ui
*/

import layers from './ui/layers/_layers.mjs';

import locations from './ui/locations/_locations.mjs';

import Dataview from './ui/Dataview.mjs';

import Tabview from './ui/Tabview.mjs';

import elements from './ui/elements/_elements.mjs';

import utils from './ui/utils/_utils.mjs';

import Gazetteer from './ui/Gazetteer.mjs';

self.ui = {
  layers,
  locations,
  elements,
  utils,
  Gazetteer,
  Dataview,
  Tabview,
};

if (mapp) {
  mapp.ui = ui;
}
