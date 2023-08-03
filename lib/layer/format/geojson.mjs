export default layer => {

  layer.Format = new ol.format.GeoJSON();

  if (!layer.features) {

    // Only assign the layer reload method if the layer has no features.
    layer.reload = loader;
  }

  if (layer?.cluster?.resolution){
    console.warn(`Layer ${layer.key} is format:wkt and does not support cluster.resolution. Please use cluster.distance instead.`)
  }
  
  function loader () {

    const fields = [...new Set([
      layer.style.theme?.field,
      layer.style.label?.field,
      layer.cluster?.label
    ].filter(field => !!field))]

    mapp.utils.xhr(
      `${layer.mapview.host}/api/query?${mapp.utils.paramString({
          template: layer.queryTemplate || 'geojson',
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: layer.table,
          filter: layer.filter?.current,
          fields
        })}`)
        .then(response => {

          if (response === null) return;

          const features = response.map((f) =>
            new ol.Feature({
              id: f.id,
              geometry: layer.Format.readGeometry(f.geometry, {
                dataProjection: 'EPSG:' + layer.srid,
                featureProjection: 'EPSG:' + layer.mapview.srid,
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

            layer.L.setSource(layer.cluster.source)

          } else {

            layer.L.setSource(source)
          }

        })

  }

  layer.L = new ol.layer[layer.vectorImage && 'VectorImage' || 'Vector']({
    key: layer.key,
    zIndex: layer.zIndex || 1,
    style: layer.styleFunction || mapp.layer.Style(layer)
  })

  if (layer.features) {

    // layer.features must be an array.
    if (!Array.isArray(layer.features)) return;

    // Create featurea from layer.features array.
    const features = layer.features.map((f) =>
      new ol.Feature({
        id: f.id,
        geometry: layer.Format.readGeometry(f.geometry, {
          dataProjection: 'EPSG:' + layer.srid,
          featureProjection: 'EPSG:' + layer.mapview.srid,
        }),
        properties: f.properties
      }))

    // Set source with layer.features.
    layer.L.setSource(new ol.source.Vector({
      features: features
    }))
  }

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
        Object.entries(fP.properties || {}).forEach(entry => {
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