import decorate from './decorate.mjs'

import formats from './format/_format.mjs';

import featureHover from './featureHover.mjs'

import featureFilter from './featureFilter.mjs'

import Style from './Style.mjs'

import categorized from './themes/categorized.mjs'

import distributed from './themes/distributed.mjs'

import graduated from './themes/graduated.mjs'

import multivariate from './themes/multivariate.mjs'

export default {
  decorate,
  formats,
  featureHover,
  featureFilter,
  Style,
  themes: {
    categorized,
    distributed,
    graduated,
    multivariate
  }
}