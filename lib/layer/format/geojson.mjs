export default layer => {

  layer.format = new ol.format.GeoJSON();

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

          if (response === null) return;

          const features = response.map((f) =>
            new ol.Feature({
              id: f.id,
              geometry: layer.format.readGeometry(f.geometry, {
                dataProjection: "EPSG:" + layer.srid,
                featureProjection: "EPSG:" + layer.mapview.srid,
              }),
              properties: f.properties
            }))

          let source = new ol.source.Vector({
            features: features
          })

          // Geojson is a cluster layer.
          if (layer.cluster) {

            // Create cluster source.
            layer.cluster.source = new ol.source.Cluster({
              distance: layer.cluster.distance || 50,
              source
            })
          }
          
          layer.L.setSource(layer.cluster.source)

        })

  }

  layer.L = new ol.layer[layer.vectorImage && 'VectorImage' || 'Vector']({
    key: layer.key,
    zIndex: layer.zIndex || 1,
    style: layer.styleFunction || mapp.layer.Style(layer)
  })

  // Change method for the cluster feature properties and layer stats.
  layer.cluster && layer.L.on('change', e => {

    delete layer.max_size;

    const feature_counts = layer.cluster.source.getFeatures().map(F => {

      const features = F.get('features')

      // Set cluster feature id for highlight interaction.
      F.set('id', features[0].get('id'), true)

      if (features.length > 1) {

        // Set cluster count.
        F.set('count', features.length, true)

      } else {

        let fP = features[0].getProperties()

        // Set feature properties for for single location cluster.
        Object.entries(fP.properties).forEach(entry => {
          F.set(entry[0], entry[1], true)
        })

      }
      
      // Return length for calculation of max_size.
      return features.length
    })
  
    if (!feature_counts.length) return;

    // Calculate max_size for cluster size styling.
    layer.max_size = Math.max(...feature_counts)
  })

}