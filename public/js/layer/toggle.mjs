import _xyz from '../_xyz.mjs';

export default layer => _xyz.utils.createElement({
  tag: 'i',
  options: {
    textContent: layer.display ? 'layers' : 'layers_clear',
    className: 'material-icons cursor noselect btn_header',
    title: 'Toggle visibility'
  },
  appendTo: layer.header,
  eventListener: {
    event: 'click',
    funct: e => {

      e.stopPropagation();

      // Toggle layer display property.
      layer.display = !layer.display;

      // Show layer.
      if (layer.display) return layer.show();

      // Hide layer.
      layer.remove();

    }
  }
});