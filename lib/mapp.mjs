import utils from './utils/_utils.mjs'

import hooks from './hooks.mjs'

import dictionaries from './dictionaries/_dictionaries.mjs'

import layer from './layer/_layer.mjs'

import location from './location/_location.mjs'

import Mapview from './mapview/_mapview.mjs'

import * as plugins from './plugins.mjs'

hooks.parse();

self.mapp = {
  version: '4.7.8-alpha',
  hash: '594f57978f5b9a2398d9f937f7eb08cecfea9d86',

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