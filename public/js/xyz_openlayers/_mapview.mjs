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
import sourceXYZ from 'ol/source/XYZ';

import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import popup from './popup.mjs';

import btn from './btn.mjs';

import panes from './panes.mjs';

export default _xyz => {

  _xyz.mapview = {};

  _xyz.mapview.lib = {};


  _xyz.mapview.lib.tileLayer = uri => {
    return new layerTile({
      source: new sourceOSM({
        url: uri
      })
    });
  };


  // _xyz.mapview.lib = {
  //   Map: Map,
  //   View: View,
  //   layerTile: layerTile,
  //   sourceOSM: sourceOSM,
  // };

  // _xyz.mapview.Map = Map;
  // _xyz.mapview.View = View;

  // _xyz.ol = {};
  // _xyz.ol.Map = Map;
  // _xyz.ol.View = View;
  // _xyz.ol.Overlay = Overlay;
  // _xyz.ol.TileLayer = TileLayer;
  // _xyz.ol.XYZ = XYZ;
  // _xyz.ol.interactionDefaults = defaults;
  // _xyz.ol.proj = proj;
  // _xyz.ol.ScaleLine = ScaleLine;
  // _xyz.ol.Feature = Feature;
  // _xyz.ol.Polygon = Polygon;
  // _xyz.ol.source = source;
  // _xyz.ol.style = style;
  // _xyz.ol.format = format;
  // _xyz.ol.layer = layer;
  // _xyz.ol.interaction = interaction;
  // _xyz.ol.condition = condition;
  // _xyz.ol.geom = geom;

  _xyz.mapview.create = create(_xyz);

  _xyz.mapview.changeEndEvent = new CustomEvent('changeEnd');

  _xyz.mapview.attribution = attribution(_xyz);

  //_xyz.mapview.locate = locate(_xyz);

  _xyz.mapview.popup = popup(_xyz);

  _xyz.mapview.btn = btn(_xyz);

  _xyz.mapview.panes = panes(_xyz);

};