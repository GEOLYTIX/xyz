/**
### /layer/featureStyle
Exports the featureStyle method to assign style methods to OL vector layer.

@requires /utils/olStyle

@module /layer/featureStyle
*/

/**
@function featureStyle
@description
Returns a style function for OL vector layers.

@param {Object} layer The layer object.

@returns {function} The style function for the layer.
*/
export default function featureStyle(layer) {

  /**
  @function Style
  @description
  Style functions process [vector] features and return an OL style to the layer render.

  The olStyle module method is required to create an array of OL styles from the feature-style object.

  @param {Object} feature The vector feature to style.

  @returns {array} Array of OL styles.
  */
  return function Style(feature) {

    // Style caching must be disabled with a null flag.
    if (layer.style.cache !== null) {

      // Get and return OL styles object.
      const Styles = feature.get('Styles')

      if (Styles) return Styles
    }

    featureProperties(feature, layer)

    if (feature.properties === null) {

      // The feature will not be visible.
      return null
    }

    // A filter flag is set either in the layer styles object or in the theme.
    if ((layer.style.filter || layer.style.theme?.filter)

      // The current filter contains field keys.
      && layer.filter.current && Object.keys(layer.filter.current).length

      // Check whether the feature should be caught by layer feature filter.
      && mapp.layer.featureFilter(layer.filter.current, feature)) {

      // The feature will not be visible.
      return null
    }

    // Set style.default as feature.style.
    feature.style = layer.style.default

    if (Object.hasOwn(mapp.layer.themes, layer.style.theme?.type)) {

      // Apply theme style to style object.
      mapp.layer.themes[layer.style.theme?.type]?.(layer.style.theme, feature)
    }

    // Style cluster point features.
    clusterStyle(feature, layer)

    // Scale point icons.
    iconScale(feature, layer)

    // Assign highlight style if required.
    highlightStyle(feature, layer)

    // Assign label style if required.
    labelStyle(feature, layer)

    // Assign selected style if required.
    selectedStyle(feature, layer)

    // 
    const Styles = mapp.utils.style(feature.style, feature)

    return Styles
  }
}

/**
@function featureProperties

@description
Assigns feature properties based on layer configuration.

@param {Object} feature
@param {layer} layer
*/
function featureProperties(feature, layer) {

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
    if (!lookupFeature) {
      feature.properties = null
      return
    }

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
@function clusterStyle

@description
Applies cluster style to the feature based on layer configuration.

@param {Object} feature
@param {layer} layer
*/
function clusterStyle(feature, layer) {

  if (!feature.properties?.count) return;

  if (feature.properties.count === 1) return;

  if (!layer.style.cluster) return;

  // Spread cluster style into feature.style.
  feature.style = {
    ...feature.style,
    ...layer.style.cluster
  }

  const clusterScale = parseFloat(layer.style.cluster.clusterScale)

  // Cluster icons will NOT scale if clusterScale is 0 or null.
  if (clusterScale) {

    // The clusterScale will be added to the icon scale.
    feature.style.clusterScale = layer.style.cluster.logScale
    
      // A natural log will be applied to the cluster scaling.
      ? Math.log(clusterScale) / Math.log(layer.max_size) * Math.log(feature.properties.count)

      // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
      : clusterScale / layer.max_size * feature.properties.count

    // 1 must be added to the feature clusterScale to prevent the icon shrinking by multiplying the icon scale by a fraction.
    feature.style.clusterScale += 1
  }
}

/**
@function iconScale

@description
The iconScale method applies icon scale modifier in regards to the mapview zoom scale and/or feature properties.

The scale [size] of icons based on their property values should always increase. The scale is therefore calculated as fraction of the property value divided by the maxFactor. A property value of 50 [%] with a maxFactor of 100 [default] would add a fracyion of .5 to 1 to ensure that the icon scale is increased by multiplying the scale by 1.5.

The property values of feature in a cluster are summed up with the cluster flag. Set to "avg" the features field sum is divided by the features[] array length to calculate an average.

@param {Object} feature
@param {layer} layer
@property {layer-style} layer.style The layer style configuration.
@property {numeric} [style.zoomInScale] Icon scale increases with zoom level.
@property {numeric} [style.zoomOutScale] Icon scale decreases with zoom level.
@property {Object} [style.icon_scaling] Configuration for property scaling.
@property {string} icon_scaling.field Feature property to use for icon scaling.
@property {string} [icon_scaling.maxFactor] Scaling is a fraction of the field value divided by the maxFactor.
@property {string} [icon_scaling.cluster] Sum cluster feature field values if not falsy. Set to "avg" to calculate averages.
*/
function iconScale(feature, layer) {

  // Only applies to style icon.
  if (!feature.style.icon) return;

  // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
  if (layer.style.zoomInScale) {

    // The icon scale will be multiplied by the mapview zoom.
    feature.style.zoomInScale = layer.style.zoomInScale * layer.mapview.Map.getView().getZoom()
  }

  // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
  if (layer.style.zoomOutScale) {

    // The icon scale will be divided by the mapview zoom.
    feature.style.zoomOutScale = layer.style.zoomOutScale / layer.mapview.Map.getView().getZoom()
  }

  if (typeof layer.style.icon_scaling !== 'object') return;

  if (!layer.style.icon_scaling?.field) return;

  let fieldValue = Number(feature.properties[layer.style.icon_scaling.field])

  if (feature.properties.features?.length > 1) {

    // Do not scale cluster feature icons.
    if (!layer.style.icon_scaling.cluster) return;

    fieldValue = 0

    feature.properties.features.forEach(f =>{

      // Add field value of each feature in cluster.
      fieldValue += Number(f.getProperties().properties[layer.style.icon_scaling.field])
    })

    if (layer.style.icon_scaling.cluster === 'avg') {

      // Average fieldValue by dividing the cluster size.
      fieldValue /= feature.properties.features.length
    }
  }

  if (isNaN(fieldValue)) return;

  // fieldScale must be bigger than 1 to prevent shrinking.
  feature.style.fieldScale = 1 + fieldValue / layer.style.icon_scaling.maxFactor
}

/**
@function highlightStyle

@description
Applies highlight style to the feature based on layer configuration.

@param {Object} feature
@param {layer} layer
*/
function highlightStyle(feature, layer) {

  // Layer must have a highlight style.
  if (!layer.style.highlight) return;

  // Layer must have a highlighted feature stored as layer.highlighted.
  if (!layer.highlight) return;

  // The layer.highlight must be a match for the feature ID.
  if (layer.highlight !== (feature.get('id') || feature.getId())) return;

  feature.style = {
    ...feature.style,
    ...layer.style.highlight
  }
}

/**
@function labelStyle

@description
Applies label style to the feature based on layer configuration.

@param {Object} feature
@param {layer} layer
*/
function labelStyle(feature, layer) {

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
@function selectedStyle

@description
Checks whether location from a feature is in the layer mapview.locations list and applies the selected style to the feature if defined.

@param {Object} feature
@param {layer} layer
*/
function selectedStyle(feature, layer) {

  // Return before lookup in mapview.locations object.
  if (layer.style.selected === undefined) return;

  // Check whether the feature referenced in mapview.locations
  if (layer.mapview?.locations[`${layer.key}!${feature.properties.id}`]) {

    feature.style = layer.style.selected
  }
}
