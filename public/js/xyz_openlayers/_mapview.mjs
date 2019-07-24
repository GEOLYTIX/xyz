import formatMVT from 'ol/format/MVT';
import formatGeoJSON from 'ol/format/GeoJSON';

import sourceOSM from 'ol/source/OSM';
import sourceVectorTile from 'ol/source/VectorTile';
import sourceVector from 'ol/source/Vector';

import layerTile from 'ol/layer/Tile';
import layerVectorTile from 'ol/layer/VectorTile';
import layerVector from 'ol/layer/Vector';

import {Circle, Fill, Stroke, Icon, Style, Text} from 'ol/style';

import {transform, transformExtent, fromLonLat} from 'ol/proj';

import {defaults, Pointer, Select} from 'ol/interaction.js';

import {click, pointerMove, altKeyOnly} from 'ol/events/condition.js';

import {Map, View, Feature, Overlay} from 'ol';

import {Point, Polygon} from 'ol/geom';

import {ScaleLine} from 'ol/control';

import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import geoJSON from './geoJSON.mjs';

import popup from './popup.mjs';

import _pointerMove from './pointerMove.mjs';

import select from './select.mjs';

import clearHighlight from './clearHighlight.mjs';

import infotip from './infotip.mjs';

import btn from './btn.mjs';

export default _xyz => {

  const lib = {

    ol: {

      Map: Map,

      View: View,

      Feature: Feature,

      Overlay: Overlay,

      control: {
        ScaleLine: ScaleLine,
      },

      interaction: {
        defaults: defaults,
        Pointer: Pointer,
        Select: Select,
      },

      events: {
        click: click,
      },

      proj: {
        transform: transform,
        transformExtent: transformExtent,
        fromLonLat: fromLonLat,
      },

      geom: {
        Point: Point,
        Polygon: Polygon,
      },

      format: {
        MVT: formatMVT,
        GeoJSON: formatGeoJSON,
      },
  
      source: {
        OSM: sourceOSM,
        VectorTile: sourceVectorTile,
        Vector: sourceVector,
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
  
    },

    geoJSON: geoJSON,

    icon: icon,

    getBounds: getBounds,

    flyToBounds: flyToBounds,

    getZoom: getZoom,

  };

  _xyz.mapview = {
    lib: lib
  };

  Object.assign(_xyz.mapview, {

    create: create(_xyz),

    changeEndEvent : new CustomEvent('changeEnd'),
  
    attribution: attribution(_xyz),
  
    locate: locate(_xyz),
  
    select: select(_xyz),
  
    pointerMove: _pointerMove(_xyz),
  
    highlight: {},
  
    clearHighlight: clearHighlight(_xyz),
  
    popup: {
      create: popup(_xyz)
    },
  
    infotip: infotip(_xyz),

    geoJSON: geoJSON,

    icon: icon,

    getBounds: getBounds,

    flyToBounds: flyToBounds,

    getZoom: getZoom,
  
    btn: btn(_xyz),

  });

  function icon(icon) {
   
    const svgHeight = icon.url.match(/height%3D%22(\d+)%22/);
    const iconHeight = svgHeight != null && Array.isArray(svgHeight) && svgHeight.length == 2 ? svgHeight[1] : 1000;
    const scale = (icon.iconSize || 40) / iconHeight;

    return new _xyz.mapview.lib.ol.style.Icon({
      src: icon.url,
      scale: scale,
      //anchor: [0.5, 1],
    });
  }

  function getBounds(epsg){

    const extent = _xyz.map.getView().calculateExtent();

    if (!epsg || epsg === '3857') return {
      south: extent[1],
      west: extent[0],
      north: extent[3],
      east: extent[2],
    };

    const extent_transformed = _xyz.mapview.lib.ol.proj.transformExtent(extent,'EPSG:3857','EPSG:'+epsg);

    return {
      south: extent_transformed[1],
      west: extent_transformed[0],
      north: extent_transformed[3],
      east: extent_transformed[2],
    };

  }

  function getZoom(){
    return _xyz.map.getView().getZoom();
  }

  function flyToBounds(layers){

    _xyz.map.getView().fit(layers[0].getGeometry(), { duration: 1000 });

  }

};