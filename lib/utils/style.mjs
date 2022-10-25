export default (style, feature) => {

  if (!style) return;

  // Iterate through icon layers
  if (Array.isArray(style.icon?.layers)) {

    // Map array of styles to the style object.
    style = style.icon.layers.map(layer => {

      // Clone the style for each layer.
      let styleClone = mapp.utils.clone(style)

      // Assign the layer style to the cloned icon style.
      Object.assign(styleClone.icon, layer)

      // Return the cloned style to the style array.
      return styleClone
    })
  }

  // Create an OL style (or array of).
  const olStyle = Array.isArray(style)
    && style.map(style => getOlStyle(style, feature))
    || getOlStyle(style, feature)
  
  return olStyle
}

function getOlStyle (style, feature) {

  // Create OL fill
  style.fill = style.fillColor && new ol.style.Fill({
    color: mapp.utils.hexa(style.fillColor, style.fillOpacity)
  })

  // Create OL stroke
  style.stroke = style.strokeColor && new ol.style.Stroke({
    color: mapp.utils.hexa(style.strokeColor, style.strokeOpacity),
    width: parseFloat(style.strokeWidth || 1)
  })

  // Create OL image
  if (style.icon) {

    // Assign feature properties for memoization
    Object.assign(style.icon, feature && feature.getProperties())

    // Calculate scale for icon render
    let scale = style.icon.scale || 1
    scale *= style.icon.clusterScale || 1
    scale *= style.icon.zoomInScale || 1
    scale *= style.icon.zoomOutScale || 1
    scale *= style.icon.highlightScale || 1

    // Create icon url from svgSymbols method if not defined as url or svg source
    style.icon.url = style.icon.url || style.icon.svg || mapp.utils.svgSymbols[style.icon.type](style.icon, feature)

    // Create OL icon
    style.image = new ol.style.Icon({
      src: style.icon.url,
      crossOrigin: 'anonymous',
      scale: scale,
      anchor: style.icon.anchor || [0.5, 0.5],
    })
  }

  // commented until we know what this does.
  // if (style.image === null) return;

  // Assign ol text style if label text is not undefined.
  style.text = typeof style.label?.text !== 'undefined'
    && new ol.style.Text({
      font: style.label.font || '12px sans-serif',
      text: String(style.label.text),
      overflow: style.label.overflow,
      stroke: style.label.strokeColor && new ol.style.Stroke({
        color: style.label.strokeColor,
        width: style.label.strokeWidth || 1
      }),
      fill: new ol.style.Fill({
        color: style.label.fillColor || '#000'
      })
    })

  return new ol.style.Style(style)
}