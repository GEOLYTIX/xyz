const memoizedIcons = new Map()

export default _xyz => function(icon) {

  const scale = icon.scale || 1

  delete icon.scale

  const iconStr = JSON.stringify(icon)

  if (memoizedIcons.has(iconStr)) {
    
    icon.url = memoizedIcons.get(iconStr)

  } else {

    icon.url = _xyz.utils.svg_symbols[icon.type](icon)

    memoizedIcons.set(iconStr, icon.url)
  }

  return new ol.style.Icon({
    src: icon.url,
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  })

}