/**
## /plugins

The module exports a collection of core mapp plugins.

@module /plugins

@requires module:/plugins/admin
@requires module:/plugins/feature_info
@requires module:/plugins/fullscreen
@requires module:/plugins/keyvalue_dictionary
@requires module:/plugins/link_button
@requires module:/plugins/locator
@requires module:/plugins/login
@requires module:/plugins/svg_templates
@requires module:/plugins/userLayer
@requires module:/plugins/userLocale
@requires module:/plugins/zoomBtn
@requires module:/plugins/zoomToArea
*/

import { admin } from './admin.mjs';
import { dark_mode } from './dark_mode.mjs';
import { feature_info } from './feature_info.mjs';
import { fullscreen } from './fullscreen.mjs';
import { keyvalue_dictionary } from './keyvalue_dictionary.mjs';
import { link_button } from './link_button.mjs';
import { locator } from './locator.mjs';
import { login } from './login.mjs';
import { svg_templates } from './svg_templates.mjs';
import { userLayer } from './userLayer.mjs';
import { userLocale } from './userLocale.mjs';
import { zoomBtn } from './zoomBtn.mjs';
import { zoomToArea } from './zoomToArea.mjs';

const plugins = {
  admin,
  dark_mode,
  feature_info,
  fullscreen,
  keyvalue_dictionary,
  link_button,
  locator,
  login,
  svg_templates,
  userLayer,
  userLocale,
  zoomBtn,
  zoomToArea,
};

export default plugins;
