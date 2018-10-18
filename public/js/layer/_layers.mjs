import _xyz from '../_xyz.mjs';

import layer_formats from './format/_formats.mjs';

import layer_panels from './panel/_panels.mjs';

import layer_group from './group.mjs';

import layer_toggle from './toggle.mjs';

import layer_focus from './focus.mjs';

import layer_show from './show.mjs';

import layer_remove from './remove.mjs';

import layer_icon from './icon.mjs';

export default () => {

  // Empty the layers list.
  document.getElementById('layers').innerHTML = '';

  //Object.values(_xyz.layers.list).forEach(layer => layer.remove());

  // Remove all existing layers from map.
  // _xyz.map.eachLayer(layer => _xyz.map.removeLayer(layer));

  // Get the layers from the current locale.
  //_xyz.layers.list = JSON.parse(JSON.stringify(_xyz.ws.locales[_xyz.locale].layers));
  _xyz.layers.list = _xyz.ws.locales[_xyz.locale].layers;

  // Filter invalid layers
  _xyz.layers.list = Object.keys(_xyz.layers.list)
    .filter(key => key.indexOf('__') === -1)
    .reduce((obj, key) => {
      obj[key] = _xyz.layers.list[key];
      return obj;
    }, {});

  // Reset groups.
  _xyz.layers.groups = {};

  // Set the layer display from hooks then remove layer hooks.
  if (_xyz.hooks.current.layers) Object.keys(_xyz.layers.list).forEach(layer => {
    _xyz.layers.list[layer].display = (_xyz.hooks.current.layers.indexOf(layer) > -1);
  });
  _xyz.hooks.remove('layers');


  // Loop through the layers and add to layers list.
  Object.keys(_xyz.layers.list).forEach(layer => {

    // Assign layer key from object key.
    _xyz.layers.list[layer].key = layer;

    // Assign layer to be the layer object from array.
    layer = _xyz.layers.list[layer];

    // __defaults
    if (!layer.style) layer.style = {};
    if (!layer.filter) layer.filter = {};

    // Create new layer group if group does not exist yet.
    if (layer.group && !_xyz.layers.groups[layer.group]) layer_group(layer.group);

    // Create layer drawer.
    layer.drawer = _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'drawer'
      },
      style: {
        display: layer.hidden ? 'none' : 'block'
      },
      appendTo: layer.group ? _xyz.layers.groups[layer.group].container : document.getElementById('layers')
    });

    // Create layer header.
    layer.header = _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: layer.name || layer.key,
        className: 'header'
      },
      style: {
        borderBottom: '2px solid ' + (((layer.style || {}).default || {}).color ? layer.style.default.color : '#333')
      },
      appendTo: layer.drawer
    });

    // Add loader bar to layer drawer.
    layer.loader = _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'loader'
      },
      appendTo: layer.drawer
    });

    // Increase pane counter and add layer pane to map.
    _xyz.panes.next += 2;
    _xyz.panes.list.push(_xyz.map.createPane(layer.key));
    _xyz.map.getPane(layer.key).style.zIndex = _xyz.panes.next;

    // Method to get data and redraw layer on map.
    layer.get = layer_formats[layer.format];

    // Method to show layer on map.
    layer.show = layer_show;

    // Method to remove layer from map.
    layer.remove = layer_remove;

    // Create control to toggle layer visibility.
    layer.toggle = layer_toggle(layer);
    
    // Create zoom to layer control
    layer_focus(layer);

    //Add panel to layer control.
    layer_panels(layer);

    //Add icon to layer header.
    layer_icon(layer);

    // Show layer if layer display is true.
    if (layer.display) layer.show();

    if (_xyz.log) console.log(layer);
    
  });
};