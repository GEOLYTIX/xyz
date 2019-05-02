export default _xyz => function (key) {

  const layer = this;

  if (layer.hover) _xyz.layers.hover(layer);

  if (layer.style) _xyz.layers.style(layer);

  if (layer.format) layer.get = _xyz.layers.format[layer.format](layer);

  layer.view();

  _xyz.layers.list[key] = layer;
  
  function bar() {

    console.log(_xyz);

    console.log(layer);
  
  }

};