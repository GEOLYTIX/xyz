import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import popup from './popup.mjs';

import btn from './btn.mjs';

import panes from './panes.mjs';

import draw from './draw/_draw.mjs';

export default _xyz => ({

  create: create(_xyz),

  changeEndEvent: new CustomEvent('changeEnd'),

  attribution: attribution(_xyz),

  locate: locate(_xyz),

  popup: popup(_xyz),

  btn: btn(_xyz),

  panes: panes(_xyz),

  draw: draw(_xyz),

});