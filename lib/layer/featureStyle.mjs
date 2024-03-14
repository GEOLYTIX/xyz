/**
### map.layer.featureStlye()
This module exports a style function for a layer
@module /layer/featureStyle
 */

/**
Creates a style function for a layer.
@function featureStyle
@param {Object} layer - The layer object.
@param {Object} layer.style - The style configuration for the layer.
@param {boolean} [layer.style.cache=null] - Flag indicating whether to cache the styles.
@param {Object} [layer.style.filter] - The filter configuration for the layer style.
@param {Object} [layer.style.theme] - The theme configuration for the layer style.
@param {Object} layer.filter - The filter configuration for the layer.
@param {Object} layer.filter.current - The current filter applied to the layer.
@param {Object} [layer.style.default] - The default style configuration for features.
@param {Object} [layer.style.cluster] - The style configuration for cluster features.
@param {number} [layer.style.cluster.clusterScale] - The scale factor for cluster icons.
@param {boolean} [layer.style.logScale] - Flag indicating whether to use logarithmic scaling for cluster icons.
@param {number} [layer.style.cluster.zoomInScale] - The scale factor for cluster icons when zooming in.
@param {number} [layer.style.cluster.zoomOutScale] - The scale factor for cluster icons when zooming out.
@param {number} [layer.max_size] - The maximum size of a cluster.
@param {Object} [layer.style.highlight] - The style configuration for highlighted features.
@param {string|number} [layer.highlight] - The ID of the currently highlighted feature.
@param {Object} [layer.style.label] - The style configuration for feature labels.
@param {boolean} [layer.style.label.display] - Flag indicating whether to display labels.
@param {string} [layer.style.label.field] - The field to use for label text.
@param {number} [layer.style.label.minZoom] - The minimum zoom level at which to display labels.
@param {number} [layer.style.label.maxZoom] - The maximum zoom level at which to display labels.
@param {Object} [layer.style.selected] - The style configuration for selected features.
@param {Object} layer.mapview - The mapview object associated with the layer.
@param {Object} layer.mapview.locations - The locations object containing selected features.
@param {Object} layer.featuresObject - An object containing feature properties indexed by feature ID.
@param {Array} [layer.featureLookup] - An array of lookup features used for styling.
@param {string} [layer.featureLookupId='id'] - The ID property to use for feature lookup.
@returns {function} The style function for the layer.
 */
export default layer => {

  return function Style(feature) {

    if (layer.style.cache !== null) {

      // Check for and return existing Styles object.
      const Styles = feature.get('Styles')

      if (Styles) return Styles
    }

    featureProperties(feature)

    // A filter flag is set either in the layer styles object or in the theme.
    if ((layer.style.filter || layer.style.theme?.filter)

      // The current filter contains field keys.
      && layer.filter.current && Object.keys(layer.filter.current).length

      // Check whether the feature should be caught by layer feature filter.
      && mapp.layer.featureFilter(layer.filter.current, feature)) {

      // The feature will not be visible.
      return null
    }

    // Assign geometryType from geometry.
    //feature.geometryType ??= feature.getGeometry().getType();

    if (Object.hasOwn(mapp.layer.themes, layer.style.theme?.type)) {

      // Apply theme style to style object.
      mapp.layer.themes[layer.style.theme?.type]?.(layer.style.theme, feature)
    } else {

      // Assign default style as feature.style.
      feature.style = structuredClone(layer.style.default)
    }

    // Style cluster point features.
    clusterStyle(feature)

    // Assign highlight style if required.
    highlightStyle(feature)

    // Assign label style if required.
    labelStyle(feature)

    // Assign selected style if required.
    selectedStyle(feature)

    return mapp.utils.style(feature.style, feature)
  }

  /**
   Assigns feature properties based on layer configuration.
   @function featureProperties
   @param {Object} feature - The feature object.
   @returns {void}
   */
  function featureProperties(feature) {

    // Assign MVT feature properties from the layer featuresObject.
    if (layer.featuresObject) {

      let id = feature.get('id').toString()

      feature.properties = {
        id,
        ...layer.featuresObject[id]
      }

    } else {

      feature.properties = feature.getProperties()
    }

    // Check whether feature is in lookup.
    if (Array.isArray(layer.featureLookup)) {

      // Find feature with matching ID property in the featureLookup
      const lookupFeature = layer.featureLookup.find(f => f[layer.featureLookupId || 'id'] === feature.properties.id)

      // Do not style features not found in the lookup array.
      if (!lookupFeature) return;

      // Assign feature.properties from the lookupFeature for subsequent styling
      Object.assign(feature.properties, lookupFeature)
    }

    // Geojson / WKT features may have a properties property
    if (feature.properties?.properties) {

      // This shouldn't happen anymore.
      // console.warn(`Feature with properties.properties`)
      // console.log(feature)
      Object.assign(feature.properties, feature.properties.properties)
      delete feature.properties.properties
    }
  }

  /**
  Applies cluster style to the feature based on layer configuration.
  @function clusterStyle
  @param {Object} feature - The feature object.
  @returns {void}
   */
  function clusterStyle(feature) {

    if (!feature.properties?.count) return;

    if (!layer.style.cluster) return;

    feature.style = structuredClone(layer.style.cluster)

    // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
    if (layer.style.cluster.clusterScale) {

      // The clusterScale will be added to the icon scale.
      feature.style.clusterScale = layer.style.logScale ?

        // A natural log will be applied to the cluster scaling.
        Math.log(layer.style.cluster.clusterScale) / Math.log(layer.max_size) * Math.log(feature.properties.size || feature.properties.count) :

        // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
        1 + (layer.style.cluster.clusterScale / layer.max_size * (feature.properties.size || feature.properties.count))
    }

    // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
    if (layer.style.cluster.zoomInScale) {

      feature.style.zoomInScale = layer.style.cluster.zoomInScale * layer.mapview.Map.getView().getZoom()
    }

    // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
    if (layer.style.cluster.zoomOutScale) {

      feature.style.zoomOutScale = layer.style.cluster.zoomInScale / layer.mapview.Map.getView().getZoom()
    }
  }

  /**
  Applies highlight style to the feature based on layer configuration.
  @function highlightStyle
  @param {Object} feature - The feature object.
  @returns {void}
   */
  function highlightStyle(feature) {

    // Layer must have a highlight style.
    if (!layer.style.highlight) return;
  
    // Layer must have a highlighted feature stored as layer.highlighted.
    if (!layer.highlight) return;
    
    // The layer.highlight must be a match for the feature ID.
    if (layer.highlight !== (feature.get('id') || feature.getId())) return;

    feature.style = {
      ...feature.style,
      ...structuredClone(layer.style.highlight)
    }
  }

  /**
  Applies label style to the feature based on layer configuration.
  @function labelStyle
  @param {Object} feature - The feature object.
  @returns {void}
   */
  function labelStyle(feature) {

    // A feature requires properties to create a label.
    if (!feature.properties) return;

    // Only styled features can be labelled.
    if (!feature.style) return;

    // The label must be displayed.
    if (!layer.style.label?.display) {
      delete feature.style.label
      return;
    }

    feature.style.label = structuredClone(layer.style.label)

    // Assign count value as text if label.count is truthy.
    feature.style.label.text = feature.style.label.count && feature.properties.count > 1 && feature.properties.count || undefined

    feature.style.label.text ??= feature.properties[feature.style.label.field] || feature.properties.label

    // Delete style.label if minZoom exceeds current zoom.
    feature.style.label?.minZoom > layer.mapview.Map.getView().getZoom() && delete feature.style.label;

    // Delere style.label if current zoom exceeds maxZoom.
    feature.style.label?.maxZoom < layer.mapview.Map.getView().getZoom() && delete feature.style.label;
  }

  /**
  Applies selected style to the feature based on layer configuration.
  @function selectedStyle
  @param {Object} feature - The feature object.
  @returns {void}
   */
  function selectedStyle(feature) {

    // Check whether the feature referenced in mapview.locations
    if (layer.mapview?.locations[`${layer.key}!${feature.properties.id}`]) {

      // The feature geometry should not be displayed.
      if (layer.style.selected === null) {
        delete feature.style;
        return;
      }

      if (layer.style.selected) {

        mapp.utils.merge(feature.style, layer.style.selected, {
          zIndex: Infinity,
        });
      }
    }
  }

}