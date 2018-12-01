import _xyz from '../_xyz.mjs';

export default layer => {

  // Add symbol to layer header.
  if (layer.format === 'cluster' && layer.style.marker) {
    _xyz.utils.createElement({
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