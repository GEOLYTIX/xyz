import highlight from './highlight.mjs';

import draw from './draw.mjs';

import edit from './edit.mjs';

import modify from './modify.mjs';

import zoom from './zoom.mjs'

export default _xyz => ({

  current: {},

  highlight: highlight(_xyz),

  draw : draw(_xyz),

  edit: edit(_xyz),

  modify: modify(_xyz),

  zoom: zoom(_xyz)

});