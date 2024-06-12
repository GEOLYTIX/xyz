/**
## mapp.layer{}
The module export methods to decorate layer objects.

@module /layer
*/

import decorate from './decorate.mjs'
import formats from './format/_format.mjs';
import fade from './fade.mjs'
import changeEnd from './changeEnd.mjs'
import featureHover from './featureHover.mjs'
import featureFilter from './featureFilter.mjs'
import * as featureFormats from './featureFormats.mjs'
import * as featureFields from './featureFields.mjs'
import Style from './Style.mjs'
import categorized from './themes/categorized.mjs'
import distributed from './themes/distributed.mjs'
import graduated from './themes/graduated.mjs'

export default {
  decorate,
  changeEnd,
  formats,
  featureFormats,
  featureFields,
  featureHover,
  featureFilter,
  fade,
  Style,
  themes: {
    categorized,
    distributed,
    graduated
  }
}