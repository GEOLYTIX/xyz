export default layer => feature => {

  feature.properties = feature.getProperties()

  // Geojson features have a properties property
  if (feature.properties.properties) {

    Object.assign(feature.properties, feature.properties.properties)
    delete feature.properties.properties
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

  // Assign properties.count from length of cluster layer features array.
  if (layer.type === 'cluster') {

    feature.properties.count = feature.get('features').length
  }

  // The featureLookup is an array of features
  if (layer.featureLookup) {

    // Find feature with matching ID property in the featureLookup
    const lookupFeature = layer.featureLookup.find(f=> f[layer.featureLookupId || 'id'] === feature.properties.id)

    // Do not style features not found in the lookup array.
    if (!lookupFeature) return;

    // Assign feature.properties from the lookupFeature for subsequent styling
    Object.assign(feature.properties, lookupFeature)
  }
  
  // Assign feature style
  feature.style =  Object.assign({},
    layer.style.default,

    // Assign cluster style
    feature.properties.count && feature.properties.count > 1 && layer.style.cluster || {},

    // Assign theme style
    layer.style.theme?.style || {})

  feature.geometryType = feature.getGeometry().getType()

  // Point features must have a style.icon
  if (feature.geometryType === 'Point') {

    // WARN!
    feature.style.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

    // The style must be cloned as icon if not otherwise defined to prevent circular reference
    feature.style.icon = Object.assign({}, feature.style.icon || mapp.utils.clone(feature.style))

  } else {

    // Other geometry types must not have a style.icon.
    delete feature.style.icon
  }

  // Scale are only valid within style.icon
  delete feature.style.scale
  delete feature.style.clusterScale

  // Apply theme style to style object.
  mapp.layer.themes[layer.style.theme?.type] && mapp.layer.themes[layer.style.theme.type](layer.style.theme, feature)

  // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
  if (feature.style.icon?.clusterScale) {

    // The clusterScale will be added to the icon scale.
    feature.style.icon.clusterScale = layer.style.logScale ?

      // A natural log will be applied to the cluster scaling.
      Math.log(feature.style.icon.clusterScale) / Math.log(layer.max_size) * Math.log(feature.properties.size || feature.properties.count) :

      // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
      1 + (feature.style.icon.clusterScale / layer.max_size * (feature.properties.size || feature.properties.count))
  }

  // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
  if (feature.style.icon?.zoomInScale) {

    feature.style.icon.zoomInScale *= layer.mapview.Map.getView().getZoom()
  }

  // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
  if (feature.style.icon?.zoomOutScale) {

    feature.style.icon.zoomOutScale /= layer.mapview.Map.getView().getZoom()
  }

  const featureID = feature.get('id') || feature.getId()

  // Apply highlight style to features which are highlighted.
  if (layer.highlight && layer.highlight === featureID){

    const highlightStyle = mapp.utils.clone(layer.style.highlight)

    if (feature.geometryType === 'Point') {

      // The highlightStyle must be cloned as icon if not otherwise defined to prevent circular reference
      highlightStyle.icon = highlightStyle.icon || highlightStyle.marker || mapp.utils.clone(highlightStyle)

      highlightStyle.icon.highlightScale = highlightStyle.icon.scale || 1

      // Remove scales to prevent assignment of highlight scale to the icon's base scale
      delete highlightStyle.icon.scale
      delete highlightStyle.scale
    } else {

      // Delete icon from highlight style if feature is not a point.
      delete highlightStyle.icon
    }

    mapp.utils.merge(feature.style, highlightStyle)
  }

  // Assign label style.
  if (layer.style.label?.display) {

    // Merge layer label style into feature.style.
    mapp.utils.merge(feature.style, {label: layer.style.label})

    // Assign count value as text if label.count is truthy.
    feature.style.label.text = feature.style.label.count && feature.properties.count > 1 && feature.properties.count || undefined

    // Assign field property value as label if text is undefined.
    if (typeof feature.style.label.text === 'undefined') {
      feature.style.label.text = feature.properties[feature.style.label.field];
    }      

    // Assign label property value as label if text is undefined.
    if (typeof feature.style.label.text === 'undefined') {
      feature.style.label.text = feature.properties.label;
    }

    // Delete style.label if minZoom exceeds current zoom.
    feature.style.label?.minZoom > layer.mapview.Map.getView().getZoom() && delete feature.style.label;

    // Delere style.label if current zoom exceeds maxZoom.
    feature.style.label?.maxZoom < layer.mapview.Map.getView().getZoom() && delete feature.style.label;
  }

  // Check whether the feature referenced in mapview.locations
  if (layer.mapview?.locations[`${layer.key}!${feature.properties.id}`]) {

    layer.style.selected &&
      mapp.utils.merge(feature.style, layer.style.selected, {
        zIndex: Infinity,
      });

    if (layer.style.selected === null) return;
  }

  return mapp.utils.style(feature.style, feature)
}