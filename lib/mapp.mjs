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

import dictionaries from './dictionaries/_dictionaries.mjs';
import dictionary from './dictionaries/_dictionary.mjs';
import hooks from './hooks.mjs';
import layer from './layer/_layer.mjs';
import location from './location/_location.mjs';
import Mapview from './mapview/_mapview.mjs';
import plugins from './plugins/_plugins.mjs';
import utils from './utils/_utils.mjs';

hooks.parse();

// Check whether Openlayers has been loaded.
if (window.ol === undefined) {
  console.warn(`Openlayers has not been loaded.`);
} else {
  if (parseFloat(ol?.util.VERSION) < 10.6) {
    console.warn(`Openlayers version ${ol?.util.VERSION} is outdated.`);
  } else {
    console.log(`Openlayers version ${ol?.util.VERSION}`)
  }
}

globalThis.mapp = {
  dictionaries,

  dictionary,

  hash: 'ca03b362a3f6b08b0483f6ae69797e2eacc2287e',

  hooks,

  host: document.head?.dataset?.dir || '',

  language: hooks.current.language || 'en',

  layer,

  location,

  Mapview,

  plugins,

  utils,

  version: '4.15.3',
};
