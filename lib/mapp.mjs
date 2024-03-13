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

import * as plugins from './plugins.mjs'

hooks.parse();

self.mapp = {
  version: '4.8.2-alpha',

  hash: '3246bd1eee43f5204fe2fa95c2cd78ca8ac0f7ab',

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