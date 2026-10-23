/**
## /ui/plugins

The module exports a collection of plugins which require the MAPP/UI library.

The ui module assigns the ui plugins to the mapp.plugins{} object.

@requires /ui/plugins/dark_mode
@requires /ui/plugins/userIDB
@requires /ui/plugins/userLayer
@requires /ui/plugins/userLocale

@module /ui/plugins
*/

import { custom_theme, dark_mode } from './dark_mode.mjs';
import { userIDB } from './userIDB.mjs';
import { userLayer } from './userLayer.mjs';
import { userLocale } from './userLocale.mjs';

/**
@typedef {Object} uiPlugins
@property {function} custom_theme The custom_theme plugin module.
@property {function} dark_mode The dark_mode plugin module.
@property {function} userIDB The userIDB plugin module.
@property {function} userLayer The userLayer plugin module.
@property {function} userLocale The userLocale plugin module.
*/

const plugins = {
  custom_theme,
  dark_mode,
  userIDB,
  userLayer,
  userLocale,
};

export default plugins;
