export default layer => {

  layer.highlight = true;

  layer.reload = loader;
  
  function loader () {

    mapp.utils.xhr(
      `${layer.mapview.host}/api/layer/geojson?${mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: layer.table,
          filter: layer.filter && layer.filter.current,
        })}`)
        .then(response => {

          const geoJSON = new ol.format.GeoJSON();

          const features = response.map((f) =>
            new ol.Feature({
              id: f.id,
              geometry: geoJSON.readGeometry(f.geometry, {
                dataProjection: "EPSG:" + layer.srid,
                featureProjection: "EPSG:" + layer.mapview.srid,
              })
            }))
      
          layer.L.setSource(new ol.source.Vector({
            useSpatialIndex: false,
            features: features,
          }))

        })

  }

  layer.L = new ol.layer.Vector({
    key: layer.key,
    zIndex: layer.style.zIndex || 1,
    style: mapp.layer.style(layer)
  })

  loader()
}