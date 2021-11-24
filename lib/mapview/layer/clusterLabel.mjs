function iOS() {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }

export default _xyz => layer => {

  if (!layer.style.label) return;

  return new ol.layer.Vector({
    source: layer.L.getSource(),
    declutter: layer.style.label ? !!layer.style.label.declutter : false,
    zIndex: layer.style.zIndex + 1 || 11,
    style: feature => {

      const properties = feature.getProperties().properties;

      return new ol.style.Style({

        text: new ol.style.Text({
          font: layer.style.label.font || '12px sans-serif',
          text: properties.label || `${properties.count > 1 ? properties.count : ''}`,
          stroke: layer.style.label.strokeColor && new ol.style.Stroke({
            color: iOS() ? '#ffffff' : layer.style.label.strokeColor,
            width: layer.style.label.strokeWidth || 1
          }),
          fill: new ol.style.Fill({
            color: layer.style.label.fillColor || '#000'
          })
        })
      })

    }
  })

}