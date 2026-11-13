/**
## MAPP

The primary module for the MAPP API will import other MAPP modules and assign itself as the `window.mapp{}` object.

The `mapp.mjs` module is used as entry point for the Vite build process to bundle the MAPP API.

The MAPP library requires Openlayers. The mapp module will check whether the Openlayers script has been loaded and will log the version. A warning will be issued if the loaded Openlayers version is outdated.

@requires /mapview
@requires /layer
@requires /location
@requires /utils
@requires /dictionary
@requires /dictionaries

@module /
*/

import { dictionaries, dictionary } from './dictionary.mjs';
import hooks from './hooks.mjs';
import layer from './layer/_layer.mjs';
import location from './location/_location.mjs';
import Mapview from './mapview/_mapview.mjs';
import plugins from './plugins/_plugins.mjs';
import utils from './utils/_utils.mjs';

hooks.parse();

// The current Openlayers [major, minor] version. 07/04/2026
const ol_current = [10, 8];

globalThis.ol ??= {};

// The major and minor versions are compared as numbers, a float would read v10.11 as below v10.8.
const [ol_major, ol_minor] = (ol.util?.VERSION || '').split('.').map(Number);

// Check whether Openlayers has been loaded.
if (!ol.util?.VERSION) {
  console.warn(`Openlayers has not been loaded.`);
} else if (
  ol_major < ol_current[0] ||
  (ol_major === ol_current[0] && ol_minor < ol_current[1])
) {
  console.warn(
    `Openlayers v${ol.util?.VERSION} below current v${ol_current.join('.')}.`,
  );
} else {
  console.log(`Openlayers v${ol.util?.VERSION}`);
}

globalThis.mapp = {
  dictionaries,
  dictionary,
  hash: 'f44e76f6a0d1d586d6a16fda9c137977f9c45609',
  hooks,
  host: document.head?.dataset?.dir || '',
  language: hooks.current.language || 'en',
  layer,
  location,
  Mapview,
  plugins,
  utils,
  version: '5.1.0',
};

// The @geolytix/mapp package exports the mapp object as default export. The mapp global remains for the MAPP.UI library and the XYZ views.
export default globalThis.mapp;
