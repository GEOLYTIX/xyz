const wkt = new ol.format.WKT

export default layer => {

  layer.format = new ol.format.GeoJSON();

  layer.reload = loader;
  
  if (layer?.cluster?.resolution){
    console.warn(`Layer ${layer.key} is format:wkt and does not support cluster.resolution. Please use cluster.distance instead.`)
  };
  
  function loader () {

    // Get unique, not empty, fields array for request.
    const fields = [...new Set([
      layer.style.theme?.field,
      layer.style.label?.field,
      layer.cluster?.label
    ].filter(field => !!field))]

    mapp.utils.xhr(
      `${layer.mapview.host}/api/layer/wkt?${mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: layer.table,
          fields,
          filter: layer.filter && layer.filter.current
        })}`)
        .then(response => {

          if (response === null) return;

          const features = response.map((r) => {

            const properties = {}

            // Assign field key and value to properties object
            fields.forEach((k,i)=>properties[k] = r[i+2])
            
            // Return feature from geometry with properties.
            return new ol.Feature({
              id: r.shift(),
              geometry: wkt.readGeometry(r.shift(), {
                dataProjection: 'EPSG:' + layer.srid,
                featureProjection: 'EPSG:' + layer.mapview.srid,
              }),
              properties
            })
  
          })


          let source = new ol.source.Vector({
            features: features
          })

          // Geojson is a cluster layer.
          if (layer.cluster?.distance > 1) {

            // Create cluster source.
            layer.cluster.source = new ol.source.Cluster({
              distance: layer.cluster.distance,
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

  // Change method for the cluster feature properties and layer stats.
  layer.cluster && layer.L.on('change', e => {

    delete layer.max_size;

    if (layer.cluster?.distance === 1) return;

    const feature_counts = layer.cluster.source?.getFeatures().map(F => {

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
  
    if (!feature_counts?.length) return;

    // Calculate max_size for cluster size styling.
    layer.max_size = Math.max(...feature_counts)
  })

}