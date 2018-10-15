import _xyz from '../../../_xyz.mjs';

export default layer => {

  if (!layer.style) layer.style = {};

  if (!layer.style.default) layer.style.default = {
    weight: 1,
    color: '#333',
    fill: true,
    fillColor: '#333',
    fillOpacity: 0.1
  };

  if (!layer.style.highlight) layer.style.highlight = {
    stroke: true,
    color: '#090',
    weight: 2,
    fillColor: '#cf9',
    fillOpacity: 0.2,
    fill: true
  };


  let timeout;

  // default colours for mvt styles
  let default_colours = [
    { hex: '#c62828', name: 'Fire Engine Red' },
    { hex: '#f50057', name: 'Folly' },
    { hex: '#9c27b0', name: 'Dark Orchid' },
    { hex: '#673ab7', name: 'Plump Purple' },
    { hex: '#3f51b5', name: 'Violet Blue' },
    { hex: '#2196f3', name: 'Dodger Blue' },
    { hex: '#03a9f4', name: 'Vivid Cerulean' },
    { hex: '#00bcd4', name: 'Turquoise Surf' },
    { hex: '#009688', name: 'Dark Cyan' },
    { hex: '#4caf50', name: 'Middle Green' },
    { hex: '#8bc34a', name: 'Dollar Bill' },
    { hex: '#cddc39', name: 'Pear' },
    { hex: '#ffeb3b', name: 'Banana Yellow' },
    { hex: '#ffb300', name: 'UCLA Gold' },
    { hex: '#fb8c00', name: 'Dark Orange' },
    { hex: '#f4511e', name: 'Orioles Orange' },
    { hex: '#8d6e63', name: 'Dark Chestnut' },
    { hex: '#777', name: 'Sonic Silver' },
    { hex: '#bdbdbd', name: 'X11 Gray' },
    { hex: '#aaa', name: 'Dark Medium Gray' },
    { hex: '#78909c', name: 'Light Slate Gray' }
  ];

  // if palette is an object then apply it. Else just take the default.
  let colours = (layer.style.palette && layer.style.palette instanceof Object) ? layer.style.palette : default_colours;

  // creates colour picker to layer
  function color_picker(layer, options) {

    let block = _xyz.utils.createElement({
      tag: 'div',
      options: {
        classList: 'block'
      },
      appendTo: options.appendTo
    });

    // title
    _xyz.utils.createElement({
      tag: 'span',
      options: {
        textContent: options.label + ': '
      },
      appendTo: block
    });

    function get_colour(hex) {

      let index = hex ?
        get_index_by_value(colours, hex, hex) :
        get_index_by_value(colours, hex, layer.style[options.style][options.property]);

      if (index === -1) return layer.style[options.style][options.property];

      return colours[index].name ?
        colours[index].name + ' (' + colours[index].hex + ')' :
        colours[index].hex;

      // return index of item which has key property and the key property equals val.
      function get_index_by_value(arr, key, val) {
        return arr.findIndex(item => item.hasOwnProperty(key) && item[key] === val);
      }
    }

    _xyz.utils.createElement({
      tag: 'span',
      options: {
        classList: 'bold',
        textContent: get_colour() || 'default',
      },
      appendTo: block
    });

    // add colour palette
    function palette(_options) {

      for (let i = 0; i < colours.length; i++) {

        _xyz.utils.createElement({
          tag: 'div',
          options: {
            textContent: '&nbsp;',
            title: colours[i].name ? colours[i].name + ' (' + colours[i].hex + ')' : colours[i].hex
          },
          style: {
            background: colours[i].hex,
            color: 'transparent',
            marginTop: '2px',
            cursor: 'pointer',
            borderRadius: '2px'
          },
          eventListener: {
            event: 'click',
            funct: e => {

              let _colour = e.target.style.background,
                _hex = rgbToHex(_colour);

              _options.appendTo.style.display = 'none';
              _options.appendTo.previousSibling.style.background = _colour;
              _options.appendTo.previousSibling.previousSibling.textContent = get_colour(_hex) || _hex;

              layer.style[_options.style][_options.property] = _hex;

              layer.get();
            }
          },
          appendTo: _options.appendTo
        });
      }
    }

    // add range
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: '&nbsp;',
        onclick: e => {
          e.target.nextSibling.style.display == 'none' ?
            e.target.nextSibling.style.display = 'block' :
            e.target.nextSibling.style.display = 'none';
        },
        onmouseleave: e => {
          e.stopPropagation();
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            timeout = null;
            e.target.nextSibling.style.display = 'none';
          }, 1.5 * 1000);
        }
      },
      style: {
        color: 'transparent',
        background: layer.style[options.style][options.property],
        cursor: 'pointer',
        borderRadius: '2px',
        boxShadow: '1px 1px 1px 1px rgba(0,0,0,0.3)'
      },
      appendTo: block
    });

    let color_pick = _xyz.utils.createElement({
      tag: 'div',
      options: {
        onmouseleave: e => {
          e.stopPropagation();
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            timeout = null;
            e.target.style.display = 'none';
          }, 1.5 * 1000);
        }
      },
      style: {
        display: 'none'
      },
      appendTo: block
    });

    palette({
      appendTo: color_pick,
      style: options.style,
      property: options.property
    });
  }

  function rgbToHex(color) {
    let hexDigits = new Array
    ('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
    
    if (color.substr(0, 1) === '#') return color;
    
    color = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return '#' + hex(color[1]) + hex(color[2]) + hex(color[3]);
    
    function hex(x) {
      return isNaN(x) ? '00' : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }
  }

  // Colour picker
  if (colours) {
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'bold btn_subtext',
        textContent: 'Default colours'
      },
      appendTo: layer.style.panel
    });

    color_picker(layer, {
      property: 'fillColor',
      label: 'Fill',
      style: 'default',
      appendTo: layer.style.panel
    });

    color_picker(layer, {
      property: 'color',
      label: 'Stroke',
      style: 'default',
      appendTo: layer.style.panel
    });

    color_picker(layer, {
      property: 'color',
      label: 'Highlight',
      style: 'highlight',
      appendTo: layer.style.panel
    });
  }

  // Begin opacity tools
  // Group title
  if (layer.style.default.stroke || layer.style.default.color || layer.style.default.fill) {
    _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'bold btn_subtext',
        textContent: 'Layer opacity'
      },
      appendTo: layer.style.panel
    });
  }

  function set_stroke_opacity(layer, opacity) {

    if (layer.style.theme) {
      Object.values(layer.style.theme.cat).map(entry => {
        if (entry.style.stroke || entry.style.color) entry.style.opacity = (opacity / 100).toFixed(2);
      });

      if (layer.style.theme.other) layer.style.default.opacity = (opacity / 100).toFixed(2);

    } else {
      layer.style.default.opacity = (opacity / 100).toFixed(2);
    }
  }

  // Stroke opacity slider.
  if (layer.style.default.stroke || layer.style.default.color) {

    _xyz.utils.slider({
      title: 'Stroke opacity: ',
      default: (!isNaN(layer.style.default.opacity) ? 100 * layer.style.default.opacity : 100) + '%',
      min: 0,
      max: 100,
      value: (!isNaN(layer.style.default.opacity) ? 100 * layer.style.default.opacity : 100),
      appendTo: layer.style.panel,
      oninput: e => {
        let opacity = e.target.value;
        e.target.parentNode.previousSibling.textContent = parseInt(opacity) + '%';

        set_stroke_opacity(layer, opacity);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          layer.get();
        }, 500);
      }
    });
  }

  function set_fill_opacity(layer, opacity) {
    if (layer.style.theme) {

      Object.values(layer.style.theme.cat).map(entry => {
        if (entry.style.fill) entry.style.fillOpacity = (opacity / 100).toFixed(2);
      });

      if (layer.style.theme.other) layer.style.default.fillOpacity = (opacity / 100).toFixed(2);

    } else {
      layer.style.default.fillOpacity = (opacity / 100).toFixed(2);
    }
  }

  // Fill opacity slider.
  if (layer.style.default.fill || layer.style.fill) {

    _xyz.utils.slider({
      title: 'Fill opacity: ',
      default: (!isNaN(layer.style.default.fillOpacity) ? 100 * layer.style.default.fillOpacity : 100) + '%',
      min: 0,
      value: (!isNaN(layer.style.default.fillOpacity) ? 100 * layer.style.default.fillOpacity : 100),
      max: 100,
      appendTo: layer.style.panel,
      oninput: e => {
        let fill_opacity = e.target.value;
        e.target.parentNode.previousSibling.textContent = parseInt(fill_opacity) + '%';

        set_fill_opacity(layer, fill_opacity);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          timeout = null;
          layer.get();
        }, 500);
      }
    });
  }
};