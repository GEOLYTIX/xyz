export default (style, feature) => {

  if (!style) return;

  const styleArr = []

  style = Array.isArray(style) ? style : [style]

  style.forEach(style => {

    if (style.icon) {

      style.icon = Array.isArray(style.icon) ? style.icon : [style.icon]

      style.icon.forEach(icon => {

        // Calculate scale for icon render
        let scale = icon.scale || 1
        scale *= style.clusterScale || 1
        scale *= style.zoomInScale || 1
        scale *= style.zoomOutScale || 1
        scale *= style.highlightScale || 1

        // Create icon url from svgSymbols method if not defined as url or svg source
        icon.url = icon.url || icon.svg || mapp.utils.svgSymbols[icon.type](icon, feature)

        styleArr.push(new ol.style.Style({
          image: new ol.style.Icon({
            src: icon.url,
            crossOrigin: 'anonymous',
            scale: scale,
            anchor: icon.anchor || [0.5, 0.5],
          })
        }))
      })

    } else {

      // Create OL fill
      let fill = style.fillColor && new ol.style.Fill({
        color: mapp.utils.hexa(style.fillColor, style.fillOpacity)
      })

      // Create OL stroke
      let stroke = style.strokeColor && new ol.style.Stroke({
        color: mapp.utils.hexa(style.strokeColor, style.strokeOpacity),
        width: parseFloat(style.strokeWidth || 1)
      })

      styleArr.push(new ol.style.Style({ fill, stroke }))
    }

    if (typeof style.label?.text !== 'undefined') {

      const text = new ol.style.Text({
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

      styleArr.push(new ol.style.Style({ text }))
    }

  })
  
  return styleArr
}