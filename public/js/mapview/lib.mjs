import formatMVT from 'ol/format/MVT';
import formatGeoJSON from 'ol/format/GeoJSON';

import sourceOSM from 'ol/source/OSM';
import sourceVectorTile from 'ol/source/VectorTile';
import sourceVector from 'ol/source/Vector';

import {bbox} from 'ol/loadingstrategy';

import layerTile from 'ol/layer/Tile';
import layerVectorTile from 'ol/layer/VectorTile';
import layerVector from 'ol/layer/Vector';

import {Circle, Fill, Stroke, Icon, Style, Text} from 'ol/style';

import {transform, transformExtent, fromLonLat} from 'ol/proj';

import {defaults as interactionDefaults, PinchZoom, PinchRotate, DragPan, Draw, Modify} from 'ol/interaction.js';

import {createBox} from 'ol/interaction/Draw.js';

import {click} from 'ol/events/condition.js';

import {Map, View, Feature, Overlay} from 'ol';

import * as geom from 'ol/geom';

import {defaults as controlDefaults, Zoom, ScaleLine} from 'ol/control';

export default () => ({

  Map: Map,
  
  View: View,
  
  Feature: Feature,
  
  Overlay: Overlay,
  
  control: {
    defaults: controlDefaults,
    Zoom: Zoom,
    ScaleLine: ScaleLine,
  },
  
  interaction: {
    defaults: interactionDefaults,
    PinchZoom: PinchZoom,
    PinchRotate: PinchRotate,
    DragPan: DragPan,
    Draw: Draw,
    Modify: Modify,
  },

  draw: {
    createBox: createBox,
  },
  
  events: {
    click: click,
  },
  
  proj: {
    transform: transform,
    transformExtent: transformExtent,
    fromLonLat: fromLonLat,
  },
  
  geom: geom,
  
  format: {
    MVT: formatMVT,
    GeoJSON: formatGeoJSON,
  },
    
  source: {
    OSM: sourceOSM,
    VectorTile: sourceVectorTile,
    Vector: sourceVector,
  },
  
  loadingstrategy: {
    bbox: bbox
  },
    
  layer: {
    Tile: layerTile,
    VectorTile: layerVectorTile,
    Vector: layerVector,
  },
    
  style: {
    Style: Style,
    Fill: Fill,
    Stroke: Stroke,
    Circle: Circle,
    Icon: Icon,
    Text: Text,
  },
  
});