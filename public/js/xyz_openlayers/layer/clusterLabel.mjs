export default (_xyz, layer) => layer.style.label && new _xyz.mapview.lib.layer.Vector({
  source: layer.L.getSource(),
  declutter: layer.style.label ? !!layer.style.label.declutter : false,
  zIndex: layer.style.zIndex || 1,
  style: feature => {
  
    const properties = feature.getProperties().properties;

    return new _xyz.mapview.lib.style.Style({
            
      text: new _xyz.mapview.lib.style.Text({
        font: layer.style.label.font || '12px sans-serif',
        text: properties.label,
        stroke: layer.style.label.strokeColor && new _xyz.mapview.lib.style.Stroke({
          color: layer.style.label.strokeColor,
          width: layer.style.label.strokeWidth || 1
        }),
        fill: new _xyz.mapview.lib.style.Fill({
          color: layer.style.label.fillColor || '#000'
        })
      })
    });
  
  }
});