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
      .alpha(parseFloat(params.fillOpacity || 1))
      .rgba()
  })

  params.stroke = params.strokeColor && new ol.style.Stroke({
    color: Chroma(params.strokeColor)
      .alpha(parseFloat(params.strokeOpacity || 1))
      .rgba(),
    width: parseFloat(params.strokeWidth || 1)
  })

  params.image = params.marker && icon(params.marker)

  return new ol.style.Style(params)
}

import svg_symbols from './svg_symbols.mjs'

const memoizedIcons = new Map()

function icon(params) {

  const scale = params.scale || 1

  delete params.scale

  const iconStr = JSON.stringify(params)

  if (memoizedIcons.has(iconStr)) {
    
    params.url = memoizedIcons.get(iconStr)

  } else {

    params.url = svg_symbols(params)

    memoizedIcons.set(iconStr, params.url)
  }

  return new ol.style.Icon({
    src: params.url,
    scale: scale,
    anchor: params.anchor || [0.5, 0.5],
  })

}