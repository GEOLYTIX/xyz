import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import geoJSON from './geoJSON.mjs';

import popup from './popup.mjs';

import interaction from './interaction/_interaction.mjs';

import getBounds from './getBounds.mjs';

import icon from './icon.mjs';

import infotip from './infotip.mjs';

import layer from './layer/_layer.mjs';

export default _xyz => ({

  create: create(_xyz),

  changeEndEvent : new CustomEvent('changeEnd'),

  attribution: attribution(_xyz),

  locate: locate(_xyz),

  interaction: interaction(_xyz),

  popup: popup(_xyz),

  infotip: infotip(_xyz),

  geoJSON: geoJSON(_xyz),

  icon: icon(_xyz),

  layer: layer(_xyz),

  getBounds: getBounds(_xyz),

  flyToBounds: (extent, params = {}) => {
    _xyz.map.getView().fit(
      extent,
      Object.assign(
        {
          padding: [50, 50, 50, 50],
          duration: 1000
        },
        params)
    );
  },

  getZoom: () => {
    return _xyz.map.getView().getZoom();
  },

});