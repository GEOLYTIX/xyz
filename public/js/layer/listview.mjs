import layer_panels from './panel/_panels.mjs';

import layer_group from './group.mjs';

import layer_toggle from './toggle.mjs';

import layer_focus from './focus.mjs';

import layer_show from './show.mjs';

import layer_remove from './remove.mjs';

import layer_icon from './icon.mjs';

export default _xyz => {

  const listview = {

    node: document.getElementById('layers'),

    init: init,

  };

  return listview;

  function init() {

    // Empty the layers list.
    _xyz.layers.listview.node.innerHTML = '';

    // Reset groups.
    _xyz.layers.listview.groups = {};

    const layer_hooks = Object.keys(_xyz.hooks.current.layers).length > 0;

    // Loop through the layers and add to layers list.
    Object.values(_xyz.layers.list).forEach(layer => {

      const displayOrg = layer.display;

      if (layer_hooks)  layer.display = !!~_xyz.hooks.current.layers.indexOf(layer.key);
      
      // Create new layer group if group does not exist yet.
      if (layer.group && !_xyz.layers.listview.groups[layer.group]) layer_group(_xyz, layer.group);

      if (layer.group && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer();

      // Create layer drawer.
      layer.drawer = _xyz.utils.createElement({
        tag: 'div',
        options: {
          className: 'drawer'
        },
        style: {
          display: layer.hidden ? 'none' : 'block'
        },
        appendTo: layer.group ? _xyz.layers.listview.groups[layer.group].container : _xyz.layers.listview.node
      });

      // Create layer header.
      layer.header = _xyz.utils.createElement({
        tag: 'div',
        options: {
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

      if (!layer.display) layer.remove();

      // Method to show layer on map.
      layer_show(_xyz, layer);

      // Method to remove layer from map.
      layer_remove(_xyz, layer);

      // Create control to toggle layer visibility.
      layer_toggle(_xyz, layer);

      // Create zoom to layer control
      layer_focus(_xyz, layer);

      //Add panel to layer control.
      layer_panels(_xyz, layer);

      //Add icon to layer header.
      layer_icon(_xyz, layer);

      if (!displayOrg && layer.display) layer.show();

      if (_xyz.log) console.log(layer);

    });

  }

};