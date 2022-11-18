import decorate from './decorate.mjs'

import hover from './hover.mjs'

import featureFilter from './featureFilter.mjs'

import Style from './Style.mjs'

import categorized from './themes/categorized.mjs'

import distributed from './themes/distributed.mjs'

import graduated from './themes/graduated.mjs'

export default {
  decorate,
  hover,
  featureFilter,
  Style,
  themes: {
    categorized,
    distributed,
    graduated
  }
}