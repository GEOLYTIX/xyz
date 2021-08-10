import Chroma from 'chroma-js'

const memoizedStyles = new Map()

export function style(params) {

  const styleStr = JSON.stringify(params)

  if (memoizedStyles.has(styleStr)) return memoizedStyles.get(styleStr)

  const olStyle = Array.isArray(params)
    && params.map(getOlStyle)
    || getOlStyle(params)

  memoizedStyles.set(styleStr, olStyle)
  
  return olStyle
}

function getOlStyle (params) {

  params.fill = params.fillColor && new ol.style.Fill({
    color: Chroma(params.fillColor)
      .alpha(params.fillOpacity === 0 ? 0 : parseFloat(params.fillOpacity || 1))
      .rgba()
  })

  params.stroke = params.strokeColor && new ol.style.Stroke({
    color: Chroma(params.strokeColor)
      .alpha(parseFloat(params.strokeOpacity || 1))
      .rgba(),
    width: parseFloat(params.strokeWidth || 1)
  })

  params.image = icon(params)

  // params.text = params.label && new ol.style.Text({
  //   font: '12px sans-serif',
  //   text: params.label,
  //   stroke: new ol.style.Stroke({
  //     color: '#000',
  //     width: 1
  //   }),
  //   fill: new ol.style.Fill({
  //     color: '#000'
  //   })
  // })

  return new ol.style.Style(params)
}

import svg_symbols from './svg_symbols.mjs'

const memoizedIcons = new Map()

function icon(params) {

  const icon = params.icon || params.marker

  if (!icon) return;

  const scale = icon.scale || 1

  delete icon.scale

  const iconStr = JSON.stringify(icon)

  if (memoizedIcons.has(iconStr)) {
    
    icon.url = memoizedIcons.get(iconStr)

  } else {

    icon.url = svg_symbols(icon)

    memoizedIcons.set(iconStr, icon.url)
  }

  return new ol.style.Icon({
    src: icon.url,
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  })

}