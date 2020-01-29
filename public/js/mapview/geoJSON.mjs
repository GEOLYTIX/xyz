export default _xyz => function (params){

  const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

  const feature = geoJSON.readFeature({
    type: 'Feature',
    geometry: params.geometry
  },{ 
    dataProjection: 'EPSG:' + (params.dataProjection || _xyz.mapview.srid),
    featureProjection:'EPSG:' + (params.featureProjection || _xyz.mapview.srid)
  });

  const sourceVector = new _xyz.mapview.lib.source.Vector({
    features: [feature]
  });
  
  const layerVector = new _xyz.mapview.lib.layer.Vector({
    source: sourceVector,
    zIndex: isNaN(params.zIndex) ? 2000 : params.zIndex,
    style: params.style
  }); 
  
  _xyz.map.addLayer(layerVector);
  
  return layerVector;

};