// import Map from 'ol/Map';
// import View from 'ol/View';
// import Overlay from 'ol/Overlay';
// import TileLayer from 'ol/layer/Tile';
// import XYZ from 'ol/source/XYZ';
// import {defaults} from 'ol/interaction';
// import * as proj from 'ol/proj';
// import {ScaleLine} from 'ol/control.js';
// import {Feature} from 'ol';
// import {Polygon} from 'ol/geom';
// import * as source from 'ol/source';
// import * as style from 'ol/style';
// import * as format from 'ol/format';
// import * as layer from 'ol/layer';
// import * as interaction from 'ol/interaction';
// import * as condition from 'ol/events/condition';
// import * as geom from 'ol/geom';

// import {Map, View} from 'ol';

import layerTile from 'ol/layer/Tile';
import sourceOSM from 'ol/source/OSM';

import formatMVT from 'ol/format/MVT';
import layerVectorTile from 'ol/layer/VectorTile';
import sourceVectorTile from 'ol/source/VectorTile';

import {Feature} from 'ol';



import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import popup from './popup.mjs';

import btn from './btn.mjs';

import panes from './panes.mjs';

export default _xyz => {

  _xyz.mapview = {};

  _xyz.mapview.lib = {
    Feature: Feature
  };


  _xyz.mapview.lib.format = {
    MVT: formatMVT
  };

  _xyz.mapview.lib.source = {
    OSM: sourceOSM,
    VectorTile: sourceVectorTile
  };

  _xyz.mapview.lib.layer = {
    Tile: layerTile,
    VectorTile: layerVectorTile
  };


  _xyz.mapview.create = create(_xyz);

  _xyz.mapview.changeEndEvent = new CustomEvent('changeEnd');

  _xyz.mapview.attribution = attribution(_xyz);

  _xyz.mapview.locate = locate(_xyz);

  _xyz.mapview.popup = popup(_xyz);

  _xyz.mapview.btn = btn(_xyz);

  _xyz.mapview.panes = panes(_xyz);

};