const geoJSON = new ol.format.GeoJSON();

export default function (params){

  const feature = params.geometry && geoJSON.readFeature({
    type: 'Feature',
    geometry: params.geometry
  },{ 
    dataProjection: `EPSG:${params.dataProjection || this.srid}`,
    featureProjection:`EPSG:${this.srid}`
  });

  const sourceVector = new ol.source.Vector()

  feature && sourceVector.addFeature(feature)
  
  const layerVector = new ol.layer.Vector({
    source: sourceVector,
    zIndex: params.zIndex,
    style: params.Style
  })
  
  this.Map.addLayer(layerVector)
  
  return layerVector
}