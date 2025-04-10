/**
## MAPP

The primary module for the MAPP API will import other MAPP modules and assign itself as the `window.mapp{}` object.

The `mapp.mjs` module is used as entry point for the esbuild process to bundle the MAPP API.

@requires /mapview
@requires /layer
@requires /location
@requires /utils
@requires /dictionary
@requires /dictionaries

@module mapp
*/

import utils from './utils/_utils.mjs';

import hooks from './hooks.mjs';

import dictionary from './dictionaries/_dictionary.mjs';

import dictionaries from './dictionaries/_dictionaries.mjs';

import layer from './layer/_layer.mjs';

import location from './location/_location.mjs';

import Mapview from './mapview/_mapview.mjs';

import plugins from './plugins/_plugins.mjs';

hooks.parse();

const _ol = {
  current: '10.3.1',
};

if (window.ol === undefined) {
  console.warn(`Openlayers has not been loaded.`);
} else {
  const olVersion = parseFloat(ol?.util.VERSION);
  const olCurrent = parseFloat(_ol.current);

  console.log(`OpenLayers version ${olVersion}`);

  if (olVersion < olCurrent) {
    console.warn(
      `Update the current OpenLayers version:${ol?.util.VERSION} to ${_ol.current}.`,
    );
  }
}

globalThis.mapp = {
  ol: _ol,

  version: '4.14.0-alpha',

  hash: '5a125a2180d22fd13ec89ae8047f52921a9676fd',

  host: document.head?.dataset?.dir || '',

  language: hooks.current.language || 'en',

  dictionaries,

  dictionary,

  hooks,

  layer,

  location,

  Mapview,

  utils,

  plugins,
};
