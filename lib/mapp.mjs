import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

hooks.parse()

const mapp = {
  version: '4.β',
  hash: '396cd9b259a8d6feb4ed21999dda54193f4c9b26',
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