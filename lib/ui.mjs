import layers from './ui/layers/_layers.mjs'

import locations from './ui/locations/_locations.mjs'

//import Dataview from './ui/dataviews/_dataview.mjs'
import Dataview from './ui/Dataview.mjs'

import Tabview from './ui/Tabview.mjs'

import elements from './ui/elements/_elements.mjs'

import utils from './ui/utils/_utils.mjs'

import gazetteer from './ui/gazetteer.mjs'

const ui = {
  layers,
  locations,
  elements,
  utils,
  gazetteer,
  Dataview,
  Tabview,
}

if (typeof window.mapp === 'object') {

  window.mapp.ui = ui

}

export default ui