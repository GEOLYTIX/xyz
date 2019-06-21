import formatMVT from 'ol/format/MVT';
import formatGeoJSON from 'ol/format/GeoJSON';

import sourceOSM from 'ol/source/OSM';
import sourceVectorTile from 'ol/source/VectorTile';
import sourceVector from 'ol/source/Vector';

import layerTile from 'ol/layer/Tile';
import layerVectorTile from 'ol/layer/VectorTile';
import layerVector from 'ol/layer/Vector';

import {Circle, Fill, Stroke, Icon, Style} from 'ol/style';

import {transform, transformExtent, fromLonLat} from 'ol/proj';

import {defaults, Pointer} from 'ol/interaction.js';

import {Map, View, Feature} from 'ol';

import {Point} from 'ol/geom';

import {ScaleLine} from 'ol/control';



import create from './create.mjs';

import attribution from './attribution.mjs';

import locate from './locate.mjs';

import popup from './popup.mjs';

import btn from './btn.mjs';

export default _xyz => {

  _xyz.mapview = {};

  _xyz.mapview.lib = {

    ol: {

      Map: Map,

      View: View,

      Feature: Feature,

      control: {
        ScaleLine: ScaleLine,
      },

      interaction: {
        defaults: defaults,
        Pointer: Pointer,
      },

      proj: {
        transform: transform,
        transformExtent: transformExtent,
        fromLonLat: fromLonLat,
      },

      geom: {
        Point: Point,
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
      },
  
    },

    geoJSON: geoJSON,

    icon: icon,
  };

  function icon(icon) {
   
    const svgHeight = icon.url.match(/height%3D%22(\d+)%22/);
    const iconHeight = svgHeight != null && Array.isArray(svgHeight) && svgHeight.length == 2 ? svgHeight[1] : 1000;
    const scale = (icon.iconSize || 40) / iconHeight;

    return new _xyz.mapview.lib.ol.style.Icon({
      src: icon.url,
      scale: scale,
      anchor: [0.5, 1],
    });
  }

  function geoJSON(params){

    const geoJSON = new _xyz.mapview.lib.ol.format.GeoJSON();

    const sourceVector = new _xyz.mapview.lib.ol.source.Vector();

    const layerVector = new _xyz.mapview.lib.ol.layer.Vector({
      source: sourceVector,
      zIndex: 20,
      style: [
        new _xyz.mapview.lib.ol.style.Style({
          stroke: new _xyz.mapview.lib.ol.style.Stroke({
            color: 'rgba(255, 255, 255, 0.2)',
            width: 8
          }),
        }),
        new _xyz.mapview.lib.ol.style.Style({
          stroke: new _xyz.mapview.lib.ol.style.Stroke({
            color: 'rgba(255, 255, 255, 0.2)',
            width: 6
          }),
        }),
        new _xyz.mapview.lib.ol.style.Style({
          stroke: new _xyz.mapview.lib.ol.style.Stroke({
            color: 'rgba(255, 255, 255, 0.2)',
            width: 4
          }),
        }),
        new _xyz.mapview.lib.ol.style.Style({
          stroke: new _xyz.mapview.lib.ol.style.Stroke({
            color: params.style.color,
            width: 2
          }),
          fill: new _xyz.mapview.lib.ol.style.Fill({
            color: _xyz.utils.hexToRGBA(params.style.color, params.style.fillOpacity || 1, true)
          }),
          image: _xyz.mapview.lib.icon(params.style.icon),
        // image: new _xyz.mapview.lib.ol.style.Circle({
        //   radius: 7,
        //   fill: new _xyz.mapview.lib.ol.style.Fill({
        //     color: 'rgba(0, 0, 0, 0.01)'
        //   }),
        //   stroke: new _xyz.mapview.lib.ol.style.Stroke({
        //     color: '#EE266D',
        //     width: 2
        //   })
        // })
        })]
    });
   

    const feature = geoJSON.readFeature({
      type: 'Feature',
      geometry: params.json.geometry
    });

    feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

    sourceVector.addFeature(feature);

    _xyz.map.addLayer(layerVector);

    return layerVector;

  };




  _xyz.mapview.create = create(_xyz);

  _xyz.mapview.changeEndEvent = new CustomEvent('changeEnd');

  _xyz.mapview.attribution = attribution(_xyz);

  _xyz.mapview.locate = locate(_xyz);

  _xyz.mapview.popup = popup(_xyz);

  _xyz.mapview.btn = btn(_xyz);

};