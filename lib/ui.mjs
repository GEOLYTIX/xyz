import layers from './ui/layers/_layers.mjs'

import locations from './ui/locations/_locations.mjs'

import Dataview from './ui/Dataview.mjs'

import Tabview from './ui/Tabview.mjs'

import elements from './ui/elements/_elements.mjs'

import utils from './ui/utils/_utils.mjs'

import Gazetteer from './ui/Gazetteer.mjs'

self.ui = (function (mapp) {

  mapp.ui = {
    layers,
    locations,
    elements,
    utils,
    Gazetteer,
    Dataview,
    Tabview,
  }

})(mapp);