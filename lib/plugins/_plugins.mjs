/**
## mapp.plugins{}

@module plugins
*/

import { admin } from './admin.mjs'
import { fullscreen } from './fullscreen.mjs'
import { keyvalue_dictionary } from './keyvalue_dictionary.mjs'
import { locator } from './locator.mjs'
import { login } from './login.mjs'
import { svg_templates } from './svg_templates.mjs'
import { zoomBtn } from './zoomBtn.mjs'
import { zoomToArea } from './zoomToArea.mjs'

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
