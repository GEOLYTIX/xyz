/**
### mapp.layer.formats.vector()

This module defines the vector format for map layers.

@module /layer/formats/vector
*/

/**
@function vector

@description
Creates Openlayers layer and source for vector format mapp layer.

@param {layer} layer The Mapp layer object.
@property {string} [layer.srid] The spatial reference system identifier (SRID) for the layer.
@property {Object} [layer.params={}] Parameters for the layer data query.
@property {function} layer.setSource Method pass features to layer source.
@property {function} layer.reload Method to reload layer data.
@property {Array} [layer.features] An array of features for the layer.
@property {boolean} [layer.fade] - Flag indicating whether to apply a fade effect to the layer.
@property {layer-cluster} [layer.cluster] Point layer cluster configuration.
@property {Object} [layer.source] OpenLayers vector source.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {number} [layer.zIndex] The zIndex for the layer canvas element.
*/

/**
@global
@typedef {Object} layer-cluster
Point layer cluster configuration.
@property {number} [distance] The distance threshold [pixel] for OL source clustering.
@property {string} [label] The field used for labeling the clusters.
@property {number} [resolution] The resolution parameter for PostGIS database cluster queries.
@property {boolean} [hexgrid] Use hexgrid clustering query for PostGIS.
*/

export default function vector(layer) {

  if (!layer.srid) {

    console.warn(`Vector Layer: ${layer.key} missing SRID.`)
    return;
  }

  // Update feature style config.
  mapp.layer.styleParser(layer)

  if (layer.properties) {
    console.warn(`Layer: ${layer.key}, layer.properties{} are no longer required for wkt & geojson datasets.`)
  }

  // Set default layer params if nullish.
  layer.params ??= { fields: [] }

  clusterConfig(layer)

  layer.setSource = (features) => {

    // The layer datasource is empty.
    if (features === null) {

      layer.L.setSource(null)
      mapp.layer.featureFields.reset(layer);
      mapp.layer.featureFields.process(layer);
      return;
    }

    if (!features) return;

    layer.source = new ol.source.Vector({
      features: mapp.layer.featureFormats[layer.format](layer, [features].flat())
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

  // Assign reload method to layer.
  layer.reload = reload;

  // Create Openlayer Vector Layer
  layer.L = new ol.layer[layer.vectorImage && 'VectorImage' || 'Vector']({
    key: layer.key,
    className: `mapp-layer-${layer.key}`,
    zIndex: layer.zIndex,
    style: layer.styleFunction || mapp.layer.featureStyle(layer)
  })

  layer.setSource(layer.features)

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

        const featureProperties = features[0].getProperties()

        // Set feature properties for for single location cluster.
        Object.entries(featureProperties).forEach(entry => {
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

/**
@function reload

@description
The layer.reload() method determines the table and geometry for the current zoom level. And uses the layer.params{} to create a request for layer features to be added to the layer source.

The xhr request is debounced by 100ms to prevent requests in quick succession on panning, scroll, and touch zooming.

The reload method is bound to the layer object and doesn't require any arguments.

Finally the optional callback function param will be executed if provided.

@param {Function} [callback] Optional callback function.
@property {Object} layer.params Parameter for data request.
@property {Object} layer.timeout Timeout for the xhr request.
*/
function reload(callback) {

  const layer = this;

  // Do not reload the layer if features have been assigned.
  if (layer.features) return;

  const table = layer.tableCurrent()

  if (!table) return;

  const geom = layer.geomCurrent()

  if (layer.fade) mapp.layer.fade(layer, true)

  // Set request params.fields for styling.
  layer.params.fields = mapp.layer.featureFields.fieldsArray(layer)

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
      .then(features => {

        // An error will be returned if the xhr fails with a bad request 400.
        if (features instanceof Error) return;

        layer.setSource(features)
      })

  }, 100)

  if (callback instanceof Function) callback(layer)
}

/**
@function clusterConfig

@description
Configures the clustering options for a layer.

@param {Object} layer The layer object.
@property {string} layer.key The key of the layer.
@property {string} layer.srid The spatial reference system identifier (SRID) for the layer.
@property {Object} layer.params Parameter for data request.
@property {Object} layer.cluster The clustering configuration for the layer.
@property {number} [cluster.distance] The distance threshold for clustering.
@property {number} [cluster.resolution] The resolution threshold for clustering.
@property {boolean} [cluster.hexgrid] Flag indicating whether to use hexgrid clustering.
*/
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

  // Check if distance is defined as <1 and layer is a format wkt
  if (layer.cluster.distance < 1) {

    console.warn(`Layer: ${layer.key}, cluster.distance is less than 1 [pixel]. The cluster config will be removed.`)

    // Remove the cluster object
    delete layer.cluster;
    return;
  }

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