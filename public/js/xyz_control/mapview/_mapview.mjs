import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import draw from './draw/_draw.mjs';

export default _xyz => ({

  create: create(_xyz),

  attribution: attribution(_xyz),

  locate: locate(_xyz),

  draw: draw(_xyz),

  state: 'select',

});