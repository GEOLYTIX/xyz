import L from 'leaflet';

import 'leaflet.vectorgrid';

import 'leaflet-draw';

import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import popup from './popup.mjs';

import btn from './btn.mjs';

import panes from './panes.mjs';

export default _xyz => {

  _xyz.mapview = {};

  _xyz.mapview.lib = L;

  _xyz.mapview.create = create(_xyz);

  _xyz.mapview.changeEndEvent = new CustomEvent('changeEnd');

  _xyz.mapview.attribution = attribution(_xyz);

  _xyz.mapview.locate = locate(_xyz);

  _xyz.mapview.popup = popup(_xyz);

  _xyz.mapview.btn = btn(_xyz);

  _xyz.mapview.panes = panes(_xyz);

};