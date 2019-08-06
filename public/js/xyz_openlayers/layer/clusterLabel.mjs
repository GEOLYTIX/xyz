export default (_xyz, layer) => new _xyz.mapview.lib.layer.Vector({
  source: layer.L.getSource(),
  declutter: true,
  zIndex: layer.style.zIndex || 1,
  style: feature => {
  
    const properties = feature.getProperties().properties;
       
    return new _xyz.mapview.lib.style.Style({
            
      text: new _xyz.mapview.lib.style.Text({
        text: properties.label,
        size: '12px',
        stroke: new _xyz.mapview.lib.style.Stroke({
          color: '#fff',
          width: 3
        }),
      })
    });
  
  }
});