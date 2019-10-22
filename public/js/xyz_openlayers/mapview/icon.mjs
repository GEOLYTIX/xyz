export default _xyz => function(icon) {

  if(icon.svg || (icon.type && icon.type !== 'circle')) icon.url = _xyz.utils.svg_symbols(icon);

  if (icon.type && icon.type === 'circle') return new _xyz.mapview.lib.style.Circle({
    radius: parseInt(icon.radius) || 10,
    fill: icon.fillColor && new _xyz.mapview.lib.style.Fill({
      color: _xyz.utils.Chroma(icon.fillColor).alpha(icon.fillOpacity === 0 ? 0 : parseFloat(icon.fillOpacity) || 1).rgba()
    }),
    stroke: icon.strokeColor && new _xyz.mapview.lib.style.Stroke({
      color: _xyz.utils.Chroma(icon.strokeColor).alpha(icon.strokeColor === 0 ? 0 : parseFloat(icon.strokeOpacity) || 1).rgba(),
      width: parseInt(icon.strokeWidth) || 1
    })
  });

  return new _xyz.mapview.lib.style.Icon({
    src: icon.url,
    scale: icon.scale || 1,
    anchor: icon.anchor || [0.5, 0.5],
  });

};