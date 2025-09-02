/**
## MAPP

The primary module for the MAPP API will import other MAPP modules and assign itself as the `window.mapp{}` object.

The `mapp.mjs` module is used as entry point for the esbuild process to bundle the MAPP API.

The MAPP library requires Openlayers. The mapp module will check whether the Openlayers script has been loaded and will log the version. A warning will be issued if the loaded Openlayers version is outdated.

@requires /mapview
@requires /layer
@requires /location
@requires /utils
@requires /dictionary
@requires /dictionaries

@module mapp
*/

import { dictionaries, dictionary } from './dictionary.mjs';
import hooks from './hooks.mjs';
import layer from './layer/_layer.mjs';
import location from './location/_location.mjs';
import Mapview from './mapview/_mapview.mjs';
import plugins from './plugins/_plugins.mjs';
import utils from './utils/_utils.mjs';

hooks.parse();

const ol_current = 10.6; //25/06/2025

// Check whether Openlayers has been loaded.
if (!ol?.util.VERSION) {
  console.warn(`Openlayers has not been loaded.`);
} else if (parseFloat(ol?.util.VERSION) < ol_current) {
  console.warn(`Openlayers v${ol?.util.VERSION} below current v${ol_current}.`);
} else {
  console.log(`Openlayers v${ol?.util.VERSION}`);
}

globalThis.mapp = {
  dictionaries,

  dictionary,

  hash: 'c3aa678427f05755ce358258c632b66e540c09a0',

  hooks,

  host: document.head?.dataset?.dir || '',

  language: hooks.current.language || 'en',

  layer,

  location,

  Mapview,

  plugins,

  utils,

  version: '4.17.2',
};
