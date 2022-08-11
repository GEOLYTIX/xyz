const geoJSON = new ol.format.GeoJSON();

export default layer => {

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

          const features = response.map((f) =>
            new ol.Feature({
              id: f.id,
              geometry: geoJSON.readGeometry(f.geometry, {
                dataProjection: "EPSG:" + layer.srid,
                featureProjection: "EPSG:" + layer.mapview.srid,
              }),
              properties: f.properties
            }))

          let source = new ol.source.Vector({
            features: features
          })

          if (layer.clusterSource) {

            source = new ol.source.Cluster({
              distance: layer.clusterSource.distance || 50,
              source
            })

          }
          
          layer.L.setSource(source)

        })

  }

  layer.L = new ol.layer.Vector({
    key: layer.key,
    zIndex: layer.zIndex || 1,
    style: layer.styleFunction || mapp.layer.Style(layer)
  })

}