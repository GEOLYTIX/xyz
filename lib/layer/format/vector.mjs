export default layer => {

  // 3857 is assumed to be the default SRID for all vector format layer.
  layer.srid ??= '3857'

  if (layer.properties) {
    console.warn(`Layer: ${layer.key}, layer.properties{} are no longer required for wkt & geojson datasets.`)
  }

  // Set default layer params if nullish.
  layer.params ??= {}

  clusterConfig(layer)

  // Assign style object if nullish.
  layer.style ??= {};

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

    if (layer.fade) mapp.layer.fade(layer)

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

  layer.reload = () => {

    // Do not reload the layer if features have been assigned.
    if (layer.features) return;

    const table = layer.tableCurrent()

    if (!table) return;

    const geom = layer.geomCurrent()

    if (layer.fade) mapp.layer.fade(layer, true)

    // Create a set of feature properties for styling.
    layer.params.fields = [...new Set([
      Array.isArray(layer.style.theme?.fields) ?
        layer.style.theme.fields : layer.style.theme?.field,
      layer.style.theme?.field,
      layer.style.label?.field,
      layer.cluster?.label
    ].flat().filter(field => !!field))]


    const bounds = layer.mapview.getBounds()

    // Assign current viewport if queryparam is truthy.
    layer.params.viewport &&= [bounds.west, bounds.south, bounds.east, bounds.north, layer.mapview.srid];

    // Assign current viewport if queryparam is truthy.
    layer.params.z &&= layer.mapview.Map.getView().getZoom();

    clearTimeout(layer.timeout)

    layer.timeout = setTimeout(() => {

      layer.xhr = mapp.utils.xhr(
        `${layer.mapview.host}/api/query?${mapp.utils.paramString({
          template: layer.params.template || layer.format,
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table,
          geom,
          srid: layer.srid,
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

  // Add event listener to reload layer for viewport or layer.tables on changeEnd.
  if (layer.tables || layer.params.viewport) {

    layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

      // Layer is outside of tables zoom range.
      if (!layer.tableCurrent()) {
        layer.L.setSource(null)
        return;
      }

      if (!layer.display) return;

      clearTimeout(layer.timeout)

      layer.timeout = setTimeout(layer.reload, 100)
    })
  }

  // Change method for the cluster feature properties and layer stats.
  layer.cluster?.distance && layer.L.on('change', e => {

    // To prevent layer.L.change() from crashing if called before data is loaded.
    if (!layer.cluster.source) return;

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

function clusterConfig(layer) {

  // The clusterConfig can not work without the layer having a cluster config object.
  if (typeof layer.cluster !== 'object') return;

  // Check if both cluster.distance and cluster.resolution are set.
  if (layer.cluster.distance && layer.cluster.resolution) {
    console.warn(`Layer: ${layer.key}, cluster.distance and cluster.resolution are mutually exclusive. You cannot use them both on the same layer. Please remove one of them. `)
    return;
  };

  // Check if neither cluster.distance and cluster.resolution are set.
  if (!layer.cluster.distance && !layer.cluster.resolution) {
    console.warn(`Layer: ${layer.key}, cluster.distance or cluster.resolution must be set.`)
    return;
  };

  // If cluster.resolution is used, the layer srid must be set to 3857.
  if (layer.cluster.resolution) {

    // Check if resolution is numeric.
    if (typeof layer.cluster.resolution === 'number') {
      // Assign resolution as float.
      layer.params.resolution = parseFloat(layer.cluster.resolution);
    } 
    // Otherwise, warn and return.
    else {
      console.warn(`Layer: ${layer.key}, cluster.resolution must be a number.`)
      return;
    }

    // Check if srid is set to 4326, not allowed for cluster layer
    if (layer.srid === '4326') {
      console.warn(`Layer: ${layer.key}, srid 4326 is not allowed for cluster.resolution layers.`)
      return;
    };

    // Provide default params for resolution cluster.
    layer.params.viewport = true;
    layer.params.z = true;

    // Format is cluster if resolution is set.
    layer.format = 'cluster';

    // Assign default template.
    layer.params.template ??= layer.cluster.hexgrid ? 'cluster_hex' : 'cluster';
  }
}