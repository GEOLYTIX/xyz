/**
## /ui/plugins

The module exports a collection of plugins which require the MAPP/UI library.

The ui module assigns the ui plugins to the mapp.plugins{} object.

@requires /ui/plugins/dark_mode

@module /ui/plugins
*/

import { custom_theme, dark_mode } from './dark_mode.mjs';

/**
@typedef {Object} uiPlugins
@property {function} custom_theme The custom_theme plugin module.
@property {function} dark_mode The dark_mode plugin module.
*/

const plugins = {
  custom_theme,
  dark_mode,
};

export default plugins;
