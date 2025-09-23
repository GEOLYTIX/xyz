/**
## /plugins

The module exports a collection of core mapp plugins.

@module /plugins

@requires module:/plugins/admin
@requires module:/plugins/feature_info
@requires module:/plugins/fullscreen
@requires module:/plugins/link_button
@requires module:/plugins/locator
@requires module:/plugins/login
@requires module:/plugins/svg_templates
@requires module:/plugins/userIDB
@requires module:/plugins/userLayer
@requires module:/plugins/userLocale
@requires module:/plugins/zoomBtn
@requires module:/plugins/zoomToArea
*/

import { admin } from './admin.mjs';
import { custom_theme, dark_mode } from './dark_mode.mjs';
import { feature_info } from './feature_info.mjs';
import { fullscreen } from './fullscreen.mjs';
import { link_button } from './link_button.mjs';
import { locator } from './locator.mjs';
import { login } from './login.mjs';
import { svg_templates } from './svg_templates.mjs';
import { test } from './test.mjs';
import { userIDB } from './userIDB.mjs';
import { userLayer } from './userLayer.mjs';
import { userLocale } from './userLocale.mjs';
import { zoomBtn } from './zoomBtn.mjs';
import { zoomToArea } from './zoomToArea.mjs';

/**
@typedef {Object} plugins
@property {function} admin The admin plugin module.
@property {function} feature_info Show feature properties in popup.
@property {function} fullscreen The fullscreen plugin module.
@property {function} keyvalue_dictionary The keyvalue_dictionary plugin module.
@property {function} locator The locator plugin module.
@property {function} login The login plugin module.
@property {function} svg_templates The svg_templates plugin module.
@property {function} zoomBtn The zoomBtn plugin module.
@property {function} zoomToArea The zoomToArea plugin module.
@property {function} link_button The link_button plugin module.
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
  svg_templates,
  test,
  userIDB,
  userLayer,
  userLocale,
  zoomBtn,
  zoomToArea,
};

export default plugins;
