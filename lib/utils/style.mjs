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

  style.fill = style.fillColor && new ol.style.Fill({
    color: mapp.utils.hexa(style.fillColor, style.fillOpacity)
  })

  style.stroke = style.strokeColor && new ol.style.Stroke({
    color: mapp.utils.hexa(style.strokeColor, style.strokeOpacity),
    width: parseFloat(style.strokeWidth || 1)
  })

  style.image = style.icon && icon(style.icon, feature)

  if (style.image === null) return;

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

const memoizedIcons = new Map()

function icon(icon, feature) {

  // Assign feature properties for memoization
  Object.assign(icon, feature && feature.getProperties())

  // Calculate scale for icon render
  let scale = icon.scale || 1
  scale *= icon.clusterScale || 1
  scale *= icon.zoomInScale || 1
  scale *= icon.zoomOutScale || 1
  scale *= icon.highlightScale || 1

  // Remove scales for memoization
  delete icon.scale
  delete icon.clusterScale
  delete icon.zoomInScale
  delete icon.zoomOutScale
  delete icon.highlightScale

  // Check memoization
  if (memoizedIcons.has(icon)) {
   
    icon.url = memoizedIcons.get(icon)

  } else {

    // Create icon url from svgSymbols method if not defined as url or svg source
    icon.url = icon.url || icon.svg || mapp.utils.svgSymbols[icon.type](icon, feature)

    memoizedIcons.set(icon, icon.url)
  }

  return new ol.style.Icon({
    src: icon.url,
    crossOrigin: 'anonymous',
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  })
}