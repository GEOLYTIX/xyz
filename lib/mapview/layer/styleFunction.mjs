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
        if (catValue < theme.cat_arr[i].catValue) break;
  
        // Set cat_style to current cat style after value check.
        var catStyle = theme.cat_arr[i].style || theme.cat_arr[i];
      }

      if (catStyle) {

        catStyle.icon = catStyle.icon || catStyle.marker || Object.assign({}, catStyle)

        _xyz.utils.merge(style, catStyle)

      }

    }
  }

  style.icon.size = style.icon.size || 1

  if (style.icon.sizing === 'logscale' && properties.count > 1) {

    style.icon.size +=  style.icon.size / Math.log(layer.max_size) * Math.log(properties.size)
  }

  // if (style.icon.sizing === 'fixed') style.icon.size = style.icon.size

  if (!style.icon.sizing && properties.count > 1) {

    style.icon.size += style.icon.size / layer.max_size * properties.size
  }

  if (style.icon.sizing === 'relative') {

    style.icon.scale *= _xyz.mapview.getZoom() / (_xyz.locale.maxZoom - _xyz.locale.minZoom)
  }

  style.icon.scale *= style.icon.size

  if (layer.highlight === feature.get('id')){

    const scale = parseFloat(style.icon.scale)

    const highlightStyle = _xyz.utils.merge({}, style, layer.style.highlight)

    highlightStyle.icon.scale *= scale

    return _xyz.utils.style(highlightStyle)
  }

  return _xyz.utils.style(style)

}