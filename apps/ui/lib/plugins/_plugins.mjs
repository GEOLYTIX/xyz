/**
## /ui/plugins

The module exports a collection of plugins which require the MAPP/UI library.

Plugins which add buttons to the mapview.mapButton element are ui plugins.

The ui module assigns the ui plugins to the mapp.plugins{} object.

@requires /ui/plugins/admin
@requires /ui/plugins/dark_mode
@requires /ui/plugins/feature_info
@requires /ui/plugins/fullscreen
@requires /ui/plugins/link_button
@requires /ui/plugins/locator
@requires /ui/plugins/login
@requires /ui/plugins/userIDB
@requires /ui/plugins/userLayer
@requires /ui/plugins/userLocale
@requires /ui/plugins/zoomBtn
@requires /ui/plugins/zoomToArea

@module /ui/plugins
*/

import { admin } from './admin.mjs';
import { custom_theme, dark_mode } from './dark_mode.mjs';
import { feature_info } from './feature_info.mjs';
import { fullscreen } from './fullscreen.mjs';
import { link_button } from './link_button.mjs';
import { locator } from './locator.mjs';
import { login } from './login.mjs';
import { userIDB } from './userIDB.mjs';
import { userLayer } from './userLayer.mjs';
import { userLocale } from './userLocale.mjs';
import { zoomBtn } from './zoomBtn.mjs';
import { zoomToArea } from './zoomToArea.mjs';

/**
@typedef {Object} uiPlugins
@property {function} admin The admin plugin module.
@property {function} custom_theme The custom_theme plugin module.
@property {function} dark_mode The dark_mode plugin module.
@property {function} feature_info Show feature properties in popup.
@property {function} fullscreen The fullscreen plugin module.
@property {function} link_button The link_button plugin module.
@property {function} locator The locator plugin module.
@property {function} login The login plugin module.
@property {function} userIDB The userIDB plugin module.
@property {function} userLayer The userLayer plugin module.
@property {function} userLocale The userLocale plugin module.
@property {function} zoomBtn The zoomBtn plugin module.
@property {function} zoomToArea The zoomToArea plugin module.
*/

const plugins = {
  admin,
  custom_theme,
  dark_mode,
  feature_info,
  fullscreen,
  link_button,
  locator,
  login,
  userIDB,
  userLayer,
  userLocale,
  zoomBtn,
  zoomToArea,
};

export default plugins;
