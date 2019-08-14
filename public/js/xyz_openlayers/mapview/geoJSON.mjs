export default _xyz => function (params){

  const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

  const sourceVector = new _xyz.mapview.lib.source.Vector();

  const layerVector = new _xyz.mapview.lib.layer.Vector({
    source: sourceVector,
    zIndex: 20,
    style: params.style,
  }); 

  const feature = geoJSON.readFeature({
    type: 'Feature',
    geometry: params.json.geometry
  },{ 
    dataProjection: `EPSG:${params.dataProjection}`,
    featureProjection:`EPSG:${params.featureProjection}`
  });

  sourceVector.addFeature(feature);

  _xyz.map.addLayer(layerVector);

  return layerVector;

};