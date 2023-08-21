export default layer => {

  if (layer.properties) {
    console.warn(`layer.properties{} are no longer required for wkt & geojson datasets.`)
  }

  if (layer?.cluster?.resolution){
    console.warn(`Layer ${layer.key} does not support cluster.resolution. Please use cluster.distance instead.`)
  }

  layer.srid ??= '4326'

  layer.setSource = (features) => {

    if (!features) return;
  
    let source = new ol.source.Vector({
      features: mapp.utils.featureFormats[layer.format](layer, [features].flat())
    })
  
    // Geojson is a cluster layer.
    if (layer.cluster?.distance) {
  
      // Create cluster source.
      layer.cluster.source = new ol.source.Cluster({
        distance: layer.cluster.distance,
        source
      })
  
      layer.L.setSource(layer.cluster.source)
      return;
    }
    
    // Set source if not cluster
    layer.L.setSource(source)
  }
  
  layer.reload = ()=>{

    // Do not reload the layer if features have been assigned.
    if (layer.features) return;

    const table = layer.tableCurrent()

    if (!table) return;

    // Create a set of feature properties for styling.
    layer.fields = [...new Set([
      // Array.isArray(layer.style.theme?.fields) ?
      //   layer.style.theme.fields : layer.style.theme?.field,
      layer.style.theme?.field,
      layer.style.label?.field,
      layer.cluster?.label
    ].flat().filter(field => !!field))]

    // Assign current viewport if not falsy.
    layer.viewport = layer.viewport && layer.mapview.getBounds();

    mapp.utils.xhr(
      `${layer.mapview.host}/api/query?${mapp.utils.paramString({
          template: layer.queryTemplate || layer.format,
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table,
          filter: layer.filter?.current,
          fields: layer.fields,
          viewport: typeof layer.viewport === 'object' && [layer.viewport.west, layer.viewport.south, layer.viewport.east, layer.viewport.north, layer.mapview.srid],
        })}`)
        .then(layer.setSource)

  }

  // Create Openlayer Vector Layer
  layer.L = new ol.layer[layer.vectorImage && 'VectorImage' || 'Vector']({
    key: layer.key,
    zIndex: layer.zIndex || 1,
    style: layer.styleFunction || mapp.layer.Style(layer)
  })

  layer.setSource(layer.features)

  let changeEndTimeout;

  // Add event listener to reload layer for viewport on changeEnd.
  layer.viewport && layer.mapview.Map.getTargetElement().addEventListener('changeEnd', ()=>{

    if (!layer.display) return;

    clearTimeout(changeEndTimeout)

    changeEndTimeout = setTimeout(layer.reload, 100)
  })

  // Change method for the cluster feature properties and layer stats.
  layer.L.on('change', e => {

    // To prevent layer.L.change() from crashing if called before data is loaded.
    if (!layer.cluster.source) return;

    if (!layer.cluster?.distance) return;

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