import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

hooks.parse()

const mapp = {
  version: '4.β',
  hash: '8e7a0b151c8b6848d3362e61d6f22e532c8796e2',
  language: hooks.current.language || 'en',
  dictionaries,
  dictionary: new Proxy({}, {
    get: function(target, key, receiver){
  
      if (mapp.dictionaries[mapp.language][key]) {
        return mapp.dictionaries[mapp.language][key]
      }
  
      return mapp.dictionaries.en[key]
  
    }}),
  hooks,
  layer,
  location,
  Mapview,
  plugins: {},
  utils,
}

window.mapp = mapp

export default mapp