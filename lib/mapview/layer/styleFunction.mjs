export default _xyz => layer => feature => {

  const properties = feature.getProperties()
  
  const style = properties.size && properties.size > 1 ?
    Object.assign({}, layer.style.default, layer.style.cluster) :
    Object.assign({}, layer.style.default);

  style.icon = style.icon || style.marker || Object.assign({}, style)

  style.icon.scale = style.icon.scale || 1

  const theme = Object.assign({}, layer.style.theme);

  // Categorized theme
  if (theme && theme.type === 'categorized') {

    var catValue = properties.cat || properties[theme.field]

    var catStyle = theme.cat[catValue]?.style || theme.cat[catValue]

    if (catStyle) {

      catStyle.icon = catStyle.icon || catStyle.marker || Object.assign({}, catStyle)

      _xyz.utils.merge(style, catStyle)

    }
  }

  // Graduated theme.
  if (theme && theme.type === 'graduated') {

    var catValue = parseFloat(properties.cat || properties[theme.field])

    if (catValue || catValue === 0) {

      // Iterate through cat array.
      for (let i = 0; i < theme.cat_arr.length; i++) {

        // Break iteration is cat value is below current cat array value.
        if (catValue < theme.cat_arr[i].value) break;
  
        // Set cat_style to current cat style after value check.
        var catStyle = theme.cat_arr[i].style || theme.cat_arr[i];
      }

      if (catStyle) {

        catStyle.icon = catStyle.icon || catStyle.marker || Object.assign({}, catStyle)

        _xyz.utils.merge(style, catStyle)

      }

    }
  }

  if (style.icon.clusterScale) {

    style.icon.scale += style.icon.logScale ?

      // A natural log will be applied to the cluster scaling.
      Math.log(style.icon.clusterScale) / Math.log(layer.max_size) * Math.log(properties.size) :

      // A fraction of the icon clusterScale will be added to the items scale for all but the biggest cluster location.
      style.icon.clusterScale / layer.max_size * properties.size
  }

  if (style.icon.zoomScale) {

    // The zoomScale should be a fraction which will be multiplied by the current map zoom to be applied to the icon scale.
    // A higher zoomScale fraction will dramatically increase the size of the item on higher zoom levels.
    style.icon.scale *= _xyz.mapview.getZoom() * style.icon.zoomScale
  }

  if (layer.highlight === feature.get('id')){

    const scale = parseFloat(style.icon.scale)

    const highlightStyle = _xyz.utils.merge({}, style, layer.style.highlight)

    highlightStyle.icon.scale *= scale

    return _xyz.utils.style(highlightStyle)
  }

  return _xyz.utils.style(style)

}