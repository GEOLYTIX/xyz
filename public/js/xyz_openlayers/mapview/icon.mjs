export default _xyz => function(icon) {
   
  const svgHeight = icon.url.match(/height%3D%22(\d+)%22/);
  const iconHeight = svgHeight != null && Array.isArray(svgHeight) && svgHeight.length == 2 ? svgHeight[1] : 1000;
  const scale = (icon.iconSize || 40) / iconHeight;

  return new _xyz.mapview.lib.style.Icon({
    src: icon.url,
    scale: scale,
    anchor: icon.anchor || [0.5, 0.5],
  });
};