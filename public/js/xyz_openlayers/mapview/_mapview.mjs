import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import geoJSON from './geoJSON.mjs';

import popup from './popup.mjs';

import pointerMove from './pointerMove.mjs';

import select from './select.mjs';

import getBounds from './getBounds.mjs';

import icon from './icon.mjs';

import clearHighlight from './clearHighlight.mjs';

import infotip from './infotip.mjs';

import btn from './btn.mjs';

export default _xyz => ({

  create: create(_xyz),

  changeEndEvent : new CustomEvent('changeEnd'),

  attribution: attribution(_xyz),

  locate: locate(_xyz),

  select: select(_xyz),

  pointerMove: pointerMove(_xyz),

  highlight: {},

  clearHighlight: clearHighlight(_xyz),

  popup: popup(_xyz),

  infotip: infotip(_xyz),

  geoJSON: geoJSON(_xyz),

  icon: icon(_xyz),

  getBounds: getBounds(_xyz),

  flyToBounds: layers => {
    _xyz.map.getView().fit(layers[0].getGeometry(), { duration: 1000 });
  },

  getZoom: () => {
    return _xyz.map.getView().getZoom();
  },

  btn: btn(_xyz)

});