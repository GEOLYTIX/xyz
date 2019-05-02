export default (_xyz, layer) => {

  // Add symbol to layer header.
  if (layer.format === 'cluster' && layer.style.marker) {
    layer.icon = _xyz.utils.createElement({
      tag: 'img',
      options: {
        src: _xyz.utils.svg_symbols(layer.style.marker),
        width: 20,
        height: 20
      },
      style: {
        float: 'right'
      },
      appendTo: layer.header
    });
  }

};