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

import Dataview from './ui/Dataview.mjs';
import elements from './ui/elements/_elements.mjs';
import Gazetteer from './ui/Gazetteer.mjs';
import layers from './ui/layers/_layers.mjs';
import locations from './ui/locations/_locations.mjs';
import Tabview from './ui/Tabview.mjs';
import utils from './ui/utils/_utils.mjs';

const ui = {
  Dataview,
  elements,
  Gazetteer,
  layers,
  locations,
  Tabview,
  utils,
};

globalThis.ui = ui;

if (mapp) {
  mapp.ui = ui;
}
