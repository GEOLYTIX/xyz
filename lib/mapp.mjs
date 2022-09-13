import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

hooks.parse()

const mapp = {
  version: '4.β',
  hash: 'f173799f80569df5a027550910749beb2d6d9a7b',
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