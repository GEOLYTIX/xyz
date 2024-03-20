/**
## mapp.plugins{}
This module serves as a collection of plugin modules for the application.
@module /plugins
*/

import { admin } from './admin.mjs'
import { fullscreen } from './fullscreen.mjs'
import { keyvalue_dictionary } from './keyvalue_dictionary.mjs'
import { locator } from './locator.mjs'
import { login } from './login.mjs'
import { svg_templates } from './svg_templates.mjs'
import { zoomBtn } from './zoomBtn.mjs'
import { zoomToArea } from './zoomToArea.mjs'

/**
@typedef {Object} plugins
@property {function} admin - The admin plugin module.
@property {function} fullscreen - The fullscreen plugin module.
@property {function} keyvalue_dictionary - The keyvalue_dictionary plugin module.
@property {function} locator - The locator plugin module.
@property {function} login - The login plugin module.
@property {function} svg_templates - The svg_templates plugin module.
@property {function} zoomBtn - The zoomBtn plugin module.
@property {function} zoomToArea - The zoomToArea plugin module.
*/
const plugins = {
  admin,
  fullscreen,
  keyvalue_dictionary,
  locator,
  login,
  svg_templates,
  zoomBtn,
  zoomToArea
}

export default plugins