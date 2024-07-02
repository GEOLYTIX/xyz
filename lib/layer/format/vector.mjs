/**
### mapp.layer.formats.vector()

This module defines the vector format for map layers.

@module /layer/formats/vector
*/

/**
@function vector

@description
Configures the vector format for a map layer.

@param {layer} layer - The layer object.
@param {string} [layer.srid] - The spatial reference system identifier (SRID) for the layer.
@param {Object} [layer.properties] - Deprecated. The properties of the layer.
@param {Object} [layer.params={}] - Additional parameters for the layer.
@param {Array} [layer.tables] - An array of table names for the layer.
@param {function} [layer.setSource] - A function to set the source of the layer.
@param {function} [layer.reload] - A function to reload the layer.
@param {ol.layer.Vector|ol.layer.VectorImage} layer.L - The OpenLayers vector or vector image layer.
@param {Array} [layer.features] - An array of features for the layer.
@param {boolean} [layer.fade] - Flag indicating whether to apply a fade effect to the layer.
@property {layer-cluster} [layer.cluster] Point layer cluster configuration.
@param {ol.source.Vector} [layer.source] - The OpenLayers vector source for the layer.
@param {Object} [layer.xhr] - The XMLHttpRequest object used for loading data.
@param {string} [layer.format] - The format of the layer data.
@param {Object} [layer.style] - The style configuration for the layer.
@param {string|Array} [layer.style.theme.fields] - The field(s) used for thematic styling.
@param {string} [layer.style.theme.field] - The field used for thematic styling.
@param {Object} [layer.style.label] - The label style configuration.
@param {string} [layer.style.label.field] - The field used for labeling features.
@param {number} [layer.zIndex] - The z-index of the layer.
@param {function} [layer.styleFunction] - The style function for the layer.
@param {Object} layer.mapview - The mapview object.
@param {string} layer.mapview.host - The host URL for the API.
@param {Object} layer.mapview.locale - The locale object.
@param {string} layer.mapview.locale.key - The key for the locale.
@param {ol.Map} layer.mapview.Map - The OpenLayers map object.
@param {Object} [layer.filter] - The filter object for the layer.
@param {function} [layer.filter.current] - The current filter function for the layer.
@param {boolean} [layer.vectorImage] - Flag indicating whether to use vector image rendering.
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
  layer.params ??= {}

  clusterConfig(layer)

  layer.setSource = (features) => {

    // The layer datasource is empty.
    if (features === null) {

      layer.L.setSource(null)
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

  // Assigns changeEnd event/method for zoom restricted layers.
  mapp.layer.changeEnd(layer)

  layer.reload = () => {

    // Do not reload the layer if features have been assigned.
    if (layer.features) return;

    const table = layer.tableCurrent()

    if (!table) return;

    const geom = layer.geomCurrent()

    if (layer.fade) mapp.layer.fade(layer, true)

    // Create a set of feature properties for styling.
    layer.params.fields = [...new Set([
      layer.params.default_fields,
      Array.isArray(layer.style.theme?.fields) ?
        layer.style.theme.fields : layer.style.theme?.field,
      layer.style.theme?.field,
      layer.style.label?.field,
      layer.cluster?.label,
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
    className: `mapp-layer-${layer.key}`,
    zIndex: layer.zIndex,
    style: layer.styleFunction || mapp.layer.featureStyle(layer)
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

/**
 * Configures the clustering options for a layer.
 * @function clusterConfig
 * @param {Object} layer - The layer object.
 * @param {Object} layer.cluster - The clustering configuration for the layer.
 * @param {number} [layer.cluster.distance] - The distance threshold for clustering.
 * @param {number} [layer.cluster.resolution] - The resolution threshold for clustering.
 * @param {boolean} [layer.cluster.hexgrid] - Flag indicating whether to use hexgrid clustering.
 * @param {string} layer.key - The key of the layer.
 * @param {string} layer.srid - The spatial reference system identifier (SRID) for the layer.
 * @param {Object} layer.params - Additional parameters for the layer.
 * @returns {void}
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