export default layer => feature => {

  const properties = feature.getProperties()

  if (layer.type === 'cluster') {

    properties.count = feature.get('features').length
  }

  // The featureLookup is an array of features
  if(layer.featureLookup) {

    // Find feature with matching ID property in the featureLookup
    const lookupFeature = layer.featureLookup.find(f=> f.id === properties.id)

    // Do not style features not found in the lookup array.
    if (!lookupFeature) return;

    // Assign properties from the lookupFeature for subsequent styling
    Object.assign(properties, lookupFeature)
  }
  
  const style =  Object.assign({},
    layer.style.default,

    // Assign cluster style
    properties.count && properties.count > 1 && layer.style.cluster || {},

    // Assign theme style
    layer.style.theme?.style || {})

  // Assign the label style to style object.
  Object.assign(style, {label: layer.style.label || null})

  const geometryType = feature.getGeometry().getType()

  if (geometryType === 'Point') {

    if (typeof style.icon === 'function') return style.icon(feature)

    // WARN!
    style.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

    // The style must be cloned as icon if not otherwise defined to prevent circular reference
    style.icon = Object.assign({}, style.icon || mapp.utils.clone(style))


  } else {

    delete style.icon
  }

  delete style.scale
  delete style.clusterScale

  const theme = layer.style.theme

  // Categorized theme
  if (theme && theme.type === 'categorized') {

    var catValue = properties.cat || properties[theme.field]

    var catStyle = theme.cat && (theme.cat[catValue]?.style || theme.cat[catValue])

    if (typeof catStyle !== 'undefined') {

      // WARN!
      catStyle.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

      // Assign icon style from the marker value or the clone the style object as icon if no marker or icon has been defined.
      catStyle.icon = geometryType === 'Point' && mapp.utils.clone(catStyle.icon || catStyle)

      // The cat label is for legends only.
      delete catStyle.label

      mapp.utils.merge(style, catStyle)
    }
  }

  // Graduated theme.
  if (theme && theme.type === 'graduated') {

    var catValue = parseFloat(properties.cat || properties[theme.field])

    if (!isNaN(catValue)) {

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        // Break iteration is cat value is below current cat array value.
        if (catValue < parseFloat(theme.cat_arr[i].value)) break;
  
        // Set cat_style to current cat style after value check.
        var catStyle = theme.cat_arr[i].style || theme.cat_arr[i];
      }

      if (catStyle) {

        // WARN!
        catStyle.marker && console.warn('style.marker will be removed in v4 release. please use style.icon')

        // Assign icon style from thparams.fillOpacity || 1e marker value or the clone the style object as icon if no marker or icon has been defined.
        catStyle.icon = geometryType === 'Point' && mapp.utils.clone(catStyle.icon || catStyle)

        delete catStyle.label

        mapp.utils.merge(style, catStyle)
      }
    }
  }

  // Cluster icons will NOT scale different to single locations if the clusterScale is not set in the cluster style.
  if (style.icon?.clusterScale) {

    // The clusterScale will be added to the icon scale.
    style.icon.clusterScale = layer.style.logScale ?

      // A natural log will be applied to the cluster scaling.
      Math.log(style.icon.clusterScale) / Math.log(layer.max_size) * Math.log(properties.size || properties.count) :

      // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
      1 + (style.icon.clusterScale / layer.max_size * (properties.size || properties.count))
  }

  // Setting a zoomInScale will INCREASE the scale of icons on higher zoom levels.
  if (style.icon?.zoomInScale) {

    style.icon.zoomInScale *= layer.mapview.Map.getView().getZoom()
  }

  // Setting a zoomOutScale will DECREASE the scale of icons on higher zoom levels.
  if (style.icon?.zoomOutScale) {

    style.icon.zoomOutScale /= layer.mapview.Map.getView().getZoom()
  }

  // Apply highlight style to features which are highlighted.
  if (layer.highlight && layer.highlight === feature.get('id')){

    const highlightStyle = mapp.utils.clone(layer.style.highlight)

    if (geometryType === 'Point') {

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

    mapp.utils.merge(style, highlightStyle)
  }

  if (style.label) {

    style.label.text =
      properties.label ||
      (style.label.count && properties.count > 1 && properties.count);

    !style.label?.display && delete style.label;

    style.label?.minZoom > layer.mapview.Map.getView().getZoom() && delete style.label;

    style.label?.maxZoom < layer.mapview.Map.getView().getZoom() && delete style.label;
  }

  if (layer.mapview?.locations[`${layer.key}!${properties.id}`]) {

    layer.style.selected &&
      mapp.utils.merge(style, layer.style.selected, {
        zIndex: Infinity,
      });

    if (layer.style.selected === null) return;
  }

  return mapp.utils.style(style, feature)
}