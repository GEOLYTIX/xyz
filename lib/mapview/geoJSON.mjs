export default function (params){

  const geoJSON = new ol.format.GeoJSON();

  let feature;

  try {

    feature = params.geometry && geoJSON.readFeature({
      type: 'Feature',
      geometry: params.geometry
    },{ 
      dataProjection: `EPSG:${params.dataProjection || this.srid}`,
      featureProjection:`EPSG:${this.srid}`
    });

  } catch (err) {

    console.error(err)
    return;
  }

  if (!feature) return;

  const layerVector = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [feature]
    }),
    zIndex: params.zIndex,
    style: params.Style
  })
  
  this.Map.addLayer(layerVector)
  
  return layerVector
}