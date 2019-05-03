export default _xyz => function (key) {

  const layer = this;

  _xyz.layers.hover(layer);

  if (layer.style && layer.style.themes) layer.style.theme = layer.style.themes[Object.keys(layer.style.themes)[0]];

  if (!layer.format || !_xyz.layers.format[layer.format]) return;
  
  layer.get = _xyz.layers.format[layer.format](layer);

  _xyz.layers.list[key] = layer;
  
};