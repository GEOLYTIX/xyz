import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

self.mapp = (function (mapp) {

  hooks.parse();

  Object.assign(mapp, {
    version: '4.β',
    hash: 'b99804a44d217702f3a633699c5ffbbe0499f4d9',
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
  
    plugins: {},
  
    utils

  })

  return mapp;

})({});