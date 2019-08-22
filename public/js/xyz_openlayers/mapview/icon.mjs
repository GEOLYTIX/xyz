export default _xyz => function(icon) {

  if (icon.type) icon.url = _xyz.utils.svg_symbols(icon);
   
  // const svgHeight = icon.url.match(/height%3D%22(\d+)%22/);
  // const iconHeight = svgHeight != null && Array.isArray(svgHeight) && svgHeight.length == 2 ? svgHeight[1] : 1000;
  // const scale = (icon.iconSize || 40) / iconHeight;

  if (icon.size) icon.scale = icon.size / 1000;

  return new _xyz.mapview.lib.style.Icon({
    src: icon.url,
    scale: icon.scale || 1,
    anchor: icon.anchor || [0.5, 0.5],
  });


  function circle() {

    const image = new _xyz.mapview.lib.style.Circle({
      radius: 7,
      fill: new _xyz.mapview.lib.style.Fill({
        color: 'rgba(0, 0, 0, 0.01)'
      }),
      stroke: new _xyz.mapview.lib.style.Stroke({
        color: '#EE266D',
        width: 2
      })
    });
    
  }
};