export default layer => {

  if (!layer.srid) {
    console.warn(`No SRID provided for ${layer.key}`)
  }

  if (layer.properties) {
    console.warn(`Layer: ${layer.key},layer.properties{} are no longer required for wkt & geojson datasets.`)
  }

  layer.params ??= {}

  if (layer?.cluster) {
    layer.params.viewport = true,
    layer.params.z = true,
    layer.params.label = layer.cluster.label
    layer.params.resolution = layer.cluster.resolution
  }

  // Assign style object if nullish.
  layer.style ??= {}

  layer.srid ??= '4326'

  layer.setSource = (features) => {

    // The layer datasource is empty.
    if (features === null) {

      layer.L.setSource(null)
      return;
    }

    if (!features) return;
  
    layer.source = new ol.source.Vector({
      features: mapp.utils.featureFormats[layer.format](layer, [features].flat())
    })

    delete layer.xhr
  
    // Geojson is a cluster layer.
    if (layer.cluster?.distance) {
  
      // Create cluster source.
      layer.cluster.source = new ol.source.Cluster({
        distance: layer.cluster.distance,
        source: layer.source
      })
  
      layer.L.setSource(layer.cluster.source)
      return;
    }
    
    // Set source if not cluster
    layer.L.setSource(layer.source)
  }
  
  layer.reload = ()=>{

    // Do not reload the layer if features have been assigned.
    if (layer.features) return;

    const table = layer.tableCurrent()

    if (!table) return;

    // Create a set of feature properties for styling.
    layer.params.fields = [...new Set([
      // Array.isArray(layer.style.theme?.fields) ?
      //   layer.style.theme.fields : layer.style.theme?.field,
      layer.style.theme?.field,
      layer.style.label?.field,
      //layer.cluster?.label
    ].flat().filter(field => !!field))]


    const bounds = layer.mapview.getBounds()

    // Assign current viewport if queryparam is truthy.
    layer.params.viewport &&= [bounds.west, bounds.south, bounds.east, bounds.north, layer.mapview.srid];

    // Assign current viewport if queryparam is truthy.
    layer.params.z &&= layer.mapview.Map.getView().getZoom();

    clearTimeout(layer.timeout)

    layer.timeout = setTimeout(()=>{

      layer.xhr = mapp.utils.xhr(
        `${layer.mapview.host}/api/query?${mapp.utils.paramString({
            template: layer.params.template || layer.format,
            locale: layer.mapview.locale.key,
            layer: layer.key,
            table,
            filter: layer.filter?.current,
            ...layer.params
          })}`)
          .then(layer.setSource)

    }, 100)
    
  }

  // Create Openlayer Vector Layer
  layer.L = new ol.layer[layer.vectorImage && 'VectorImage' || 'Vector']({
    key: layer.key,
    zIndex: layer.zIndex || 1,
    style: layer.styleFunction || mapp.layer.Style(layer)
  })

  layer.setSource(layer.features)

  // Add event listener to reload layer for viewport on changeEnd.
  layer.params.viewport && layer.mapview.Map.getTargetElement().addEventListener('changeEnd', ()=>{

    if (!layer.display) return;

    clearTimeout(layer.timeout)

    layer.timeout = setTimeout(layer.reload, 100)
  })

  // Change method for the cluster feature properties and layer stats.
  layer.L.on('change', e => {

    // Do not process cluster for non cluster layers.
    if (!layer.cluster) return;

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