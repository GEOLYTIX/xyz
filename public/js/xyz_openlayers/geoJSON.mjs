export default _xyz => function (params){

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