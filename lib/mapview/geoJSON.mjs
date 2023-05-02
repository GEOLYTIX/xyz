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

  if (feature.getGeometry().getType() !== 'Point') {

    const styles = [params.Style].flat().map(style => style.getStroke())

    // All other geometry types must have a Stroke style.
    if (!styles.some(style => !!style)) {

      params.Style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#3399CC'
        })
      })

      console.warn('Missing Stroke style for geojson vector geometry')
    }

  }
  
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