import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

import * as plugins from './plugins.mjs'

self.mapp = (function (mapp) {

  hooks.parse();

  Object.assign(mapp, {
    version: '4.4.0',
    hash: '47a24401c0b4b211ff5f581842f5c1bf647e10c1',
    language: hooks.current.language || 'en',
  
    dictionaries,
  
    dictionary: new Proxy({}, {
      get: function(target, key, receiver){
      
          if (mapp.dictionaries[mapp.language][key]) {
            return mapp.dictionaries[mapp.language][key];
          }
      
          return mapp.dictionaries.en[key];
      
        }}),
  
    hooks,
  
    layer,
  
    location,
  
    Mapview,
  
    utils,
    
    plugins

  })

  return mapp;

})({});