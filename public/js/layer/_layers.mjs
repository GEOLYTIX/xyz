import _xyz from '../_xyz.mjs';

import layer_panels from './panel/_panels.mjs';

import layer_group from './group.mjs';

import layer_toggle from './toggle.mjs';

import layer_focus from './focus.mjs';

import layer_show from './show.mjs';

import layer_remove from './remove.mjs';

import layer_icon from './icon.mjs';

_xyz.layers.init = () => {

  // Empty the layers list.
  document.getElementById('layers').innerHTML = '';
   
  // Reset groups.
  _xyz.layers.groups = {};
  
  // Loop through the layers and add to layers list.
  Object.values(_xyz.layers.list).forEach(layer => {
  
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
        //textContent: (layer.group ? '' : (layer.name || layer.key)),
        innerHTML: (layer.group ? ('&#10149; ' + layer.name) : (layer.name || layer.key)),
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
  
    // Push the layer into the layers hook array.
    if (layer.display) _xyz.hooks.push('layers', layer.key);
  
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

    //Run tableCurrent function to disable layer drawer if necessary.
    layer.tableCurrent();
   
    if (_xyz.log) console.log(layer);
      
  });
};