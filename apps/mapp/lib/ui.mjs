/**
## MAPP/UI

The primary module for the MAPP/UI API will import other MAPP/UI modules and assign itself to the `window.ui{}` object.

The `ui{}` object will be assigned to the global `mapp{}` object if loaded prior to the execution of the ui module script.

The ui plugins are assigned to the `mapp.plugins{}` object.

The alert and confirm ui elements are assigned as `mapp.utils.alert()` and `mapp.utils.confirm()`, replacing the window.alert() and window.confirm() bindings.

The `ui.mjs` module is used as entry point for the Vite build process to bundle the MAPP/UI API.

@requires /ui/elements
@requires /ui/locations
@requires /ui/layers
@requires /ui/plugins
@requires /ui/utils

@module /ui
*/

import Dataview from './ui/Dataview.mjs';
import elements from './ui/elements/_elements.mjs';
import Gazetteer from './ui/Gazetteer.mjs';
import layers from './ui/layers/_layers.mjs';
import locations from './ui/locations/_locations.mjs';
import plugins from './ui/plugins/_plugins.mjs';
import Tabview from './ui/Tabview.mjs';
import utils from './ui/utils/_utils.mjs';

const ui = {
  Dataview,
  elements,
  Gazetteer,
  layers,
  locations,
  plugins,
  Tabview,
  utils,
};

globalThis.ui = ui;
globalThis.mapp ??= {};

mapp.ui = ui;

// The ui elements override the window.alert() and window.confirm() bindings of the mapp utils.
mapp.utils ??= {};
mapp.utils.alert = elements.alert;
mapp.utils.confirm = elements.confirm;

// The ui plugins are executed by the mapview like core mapp plugins.
mapp.plugins ??= {};
Object.assign(mapp.plugins, plugins);
