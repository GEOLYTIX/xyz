/**
A location object is created by decorating a location JSON.
@module mapp

@property {string} version
The mapp library release version.

@property {object} dictionaries
Dictionaries for supported language values.

@property {method} Mapview(mapview)
Method to decorate a mapview object.
*/

import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

import plugins from './plugins/_plugins.mjs'

hooks.parse();

const _ol = {
  current: 9.1,
  load: async() => await new Promise(resolve => {

    const script = document.createElement('script')
  
    script.type = 'application/javascript'
  
    script.src = 'https://cdn.jsdelivr.net/npm/ol@v9.1.0/dist/ol.js'
  
    script.onload = resolve
  
    document.head.append(script)
  
    console.warn('Openlayers library loaded from script tag.')
  })
}

if (window.ol === undefined) {

  console.warn(`Openlayers has not been loaded.`)
  
} else {

  let olVersion = parseFloat(ol?.util.VERSION)

  console.log(`OpenLayers version ${olVersion}`)

  if (olVersion < _ol.current) {

    console.warn(`Update the current OpenLayers version:${ol?.util.VERSION} to ${_ol.current}.`)
  }
}

self.mapp = {
  ol: _ol,

  version: '4.8.8',

  hash: 'f1bbc5c23c09973c742ee3b51b6b9c20eb65bc9d',

  host: document.head?.dataset?.dir || '',
  
  language: hooks.current.language || 'en',

  dictionaries,

  dictionary: new Proxy({}, {
    get: function (target, key, receiver) {

      if (mapp.dictionaries[mapp.language][key]) {
        return mapp.dictionaries[mapp.language][key];
      }

      return mapp.dictionaries.en[key];
    }
  }),

  hooks,

  layer,

  location,

  Mapview,

  utils,

  plugins
}