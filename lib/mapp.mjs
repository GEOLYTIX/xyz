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
    version: '4.3.0',
    hash: 'ad367b84ed89378820c729d28e3c43a60f6ef2f2',
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