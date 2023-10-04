export default layer => {

  layer.style.default ??= {
    strokeColor: '#333',
    fillColor: '#fff1',
    icon: {
      type: 'dot'
    }
  }

  return function Style(feature) {

    // Check for and return existing Styles object.
    const Styles = feature.get('Styles')
    if (Styles) return Styles

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

    // Assign default style as feature.style.
    feature.style = { ...mapp.utils.clone(layer.style.default), ...layer.style.theme?.style }

    // Check whether feature is in lookup.
    if (Array.isArray(layer.featureLookup)) {

      // Find feature with matching ID property in the featureLookup
      const lookupFeature = layer.featureLookup.find(f => f[layer.featureLookupId || 'id'] === feature.properties.id)

      // Do not style features not found in the lookup array.
      if (!lookupFeature) return;

      // Assign feature.properties from the lookupFeature for subsequent styling
      Object.assign(feature.properties, lookupFeature)

    }

    // Assign geometryType from geometry.
    feature.geometryType ??= feature.getGeometry().getType();

    // Point features must have a style.icon
    if (feature.geometryType === 'Point') {

      // The style must be cloned as icon if not otherwise defined to prevent circular reference
      feature.style.icon ??= mapp.utils.clone(feature.style)

      // Assign cluster style.
      if (feature.properties.count > 1 && layer.style.cluster) {

        Object.assign(feature.style, layer.style.cluster)
      }
    }

    // Apply theme style to style object.
    mapp.layer.themes[layer.style.theme?.type]?.(layer.style.theme, feature)

    // Style point features.
    pointStyle(feature)

    // Assign highlight style if required.
    highlightStyle(feature)

    // Assign label style if required.
    labelStyle(feature)

    // Check whether the feature referenced in mapview.locations
    if (layer.mapview?.locations[`${layer.key}!${feature.properties.id}`]) {

      // The feature geometry should not be displayed.
      if (layer.style.selected === null) return;

      if (layer.style.selected) {

        mapp.utils.merge(feature.style, layer.style.selected, {
          zIndex: Infinity,
        });
      }
    }

    return mapp.utils.style(feature.style, feature)
  }

  function pointStyle(feature) {

    if (feature.geometryType !== 'Point') return;

    // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
    if (feature.style.clusterScale) {

      // The clusterScale will be added to the icon scale.
      feature.style.clusterScale = layer.style.logScale ?

        // A natural log will be applied to the cluster scaling.
        Math.log(feature.style.clusterScale) / Math.log(layer.max_size) * Math.log(feature.properties.size || feature.properties.count) :

        // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
        1 + (feature.style.clusterScale / layer.max_size * (feature.properties.size || feature.properties.count))
    }

    // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
    if (feature.style.zoomInScale) {

      feature.style.zoomInScale *= layer.mapview.Map.getView().getZoom()
    }

    // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
    if (feature.style.zoomOutScale) {

      feature.style.zoomOutScale /= layer.mapview.Map.getView().getZoom()
    }
  }

  function highlightStyle(feature) {

    // Layer must have a highlight style.
    if (!layer.style.highlight) return;
    
    // Layer must have a highlighted feature stored as layer.highlighted.
    if (!layer.highlight) return;
    
    // The layer.highlight must be a match for the feature ID.
    if (layer.highlight !== (feature.get('id') || feature.getId())) return;

    if (feature.geometryType !== 'Point') {

      // Merge highlight with feature style for non point features.
      mapp.utils.merge(feature.style, layer.style.highlight)
      return;
    }

    // Highlighted point features should be drawn on top.
    feature.style.zIndex = Infinity

    if (layer.style.highlight.icon) {

      feature.style.icon = Array.isArray(layer.style.highlight.icon)

        // Array icon styles must not be assigned.
        ? layer.highlight.icon
        : Object.assign(feature.style.icon, layer.style.highlight.icon)
    }

    // The highlight scale is defined as scale in the highlight style block.
    feature.style.highlightScale = layer.style.highlight.scale
  }

  function labelStyle(feature) {

    // The label must be displayed.
    if (!layer.style.label?.display) return;

    // Merge layer label style into feature.style.
    mapp.utils.merge(feature.style, { label: layer.style.label })

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
}