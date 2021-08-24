import Chroma from 'chroma-js'

import cloneDeep from 'lodash/cloneDeep.js'

export function style(style, feature) {

  if (Array.isArray(style.icon?.layers)) {

    style = style.icon.layers.map(layer => {

      let styleClone = cloneDeep(style)
      Object.assign(styleClone.icon, layer)

      return styleClone
    })

  }

  const olStyle = Array.isArray(style)
    && style.map(style => getOlStyle(style, feature))
    || getOlStyle(style, feature)
 
  return olStyle
}

function getOlStyle (style, feature) {

  style.fill = style.fillColor && new ol.style.Fill({
    color: Chroma(style.fillColor)
      .alpha(style.fillOpacity === 0 ? 0 : parseFloat(style.fillOpacity || 1))
      .rgba()
  })

  style.stroke = style.strokeColor && new ol.style.Stroke({
    color: Chroma(style.strokeColor)
      .alpha(parseFloat(style.strokeOpacity || 1))
      .rgba(),
    width: parseFloat(style.strokeWidth || 1)
  })

  style.image = style.icon && icon(style.icon, feature)

  style.text = style.label?.display && style.label?.text && new ol.style.Text({
    font: style.label.font || '12px sans-serif',
    text: style.label.text,
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

import svg_symbols from './svg_symbols.mjs'

const memoizedIcons = new WeakMap()

function icon(icon, feature) {

  Object.assign(icon, feature && feature.getProperties())

  // Calculate scale for icon render
  let scale = icon.scale || 1
  scale += icon.clusterScale || 0
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

    // Create icon url from svg_symbols method if not defined as url or svg source
    icon.url = icon.url || icon.svg || svg_symbols[icon.type](icon, feature)

    memoizedIcons.set(icon, icon.url)
  }

  return new ol.style.Icon({
    src: icon.url,
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  })

}