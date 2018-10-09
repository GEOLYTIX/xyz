import _xyz from '../_xyz.mjs';

import layer_formats from './format/_formats.mjs';

import layer_panels from './panel/_panels.mjs';

import layer_group from './group.mjs';

import layer_toggle from './toggle.mjs';

export default () => {

  // Empty the layers table.
  document.getElementById('layers').innerHTML = '';

  // Remove all existing layers from map.
  _xyz.map.eachLayer(layer => _xyz.map.removeLayer(layer));

  // Get the layers from the current locale.
  _xyz.layers = _xyz.ws.locales[_xyz.locale].layers;
  _xyz.layer_groups = {};

  
  // Set default attribution.
  _xyz.attribution = ['leaflet', 'xyz'];


  // Set the layer display from hooks then remove layer hooks.
  if (_xyz.hooks.layers) Object.keys(_xyz.layers).forEach(layer => {
    _xyz.layers[layer].display = (_xyz.hooks.layers.indexOf(layer) > -1);
  });
  _xyz.utils.removeHook('layers');


  // Loop through the locale layers and build layer control elements.
  Object.keys(_xyz.layers).forEach(layer => {

    // Assign layer key as layer property to layer.
    _xyz.layers[layer].layer = layer;

    // Re-assign layer to be the layer object.
    layer = _xyz.layers[layer];

    // Create layer style object if none exists.
    if (!layer.style) layer.style = {};

    // if (!layer.style.default) layer.style.default = {
    //   weight: 1,
    //   color: '#333',
    //   fill: true,
    //   fillColor: '#333',
    //   fillOpacity: 0.1
    // };

    // Set layer filter if it does not exist.
    if (!layer.filter) layer.filter = {};

    // Create new layer group if group does not exist yet.
    if (layer.group && !_xyz.layer_groups[layer.group]) layer_group(layer.group);

    // Create layer drawer.
    layer.drawer = _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'drawer'
      },
      style: {
        display: layer.hidden ? 'none' : 'block'
      },
      appendTo: layer.group ? _xyz.layer_groups[layer.group].container : document.getElementById('layers')
    });

    // Assign layer name if not set and create layer header.
    layer.name = layer.name || layer.layer;
    layer.header = _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: layer.name,
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


    // Create the pane and set layers function.
    layer.pane = layer.pane || ['default', 501];
    _xyz.map.createPane(layer.pane[0]);
    _xyz.map.getPane(layer.pane[0]).style.zIndex = layer.pane[1];


    // Assign getLayer function from format.
    layer.getLayer = layer_formats[layer.format];

    // Method to remove layer from map.
    layer.removeLayer = layer => {
      layer.loader.style.display = 'none';
      layer.clear_icon.textContent = 'layers_clear';
      layer.display = false;
      _xyz.utils.filterHook('layers', layer.layer);
        
      if (layer.attribution) layer.attribution.forEach(a => {
        let foo = _xyz.attribution.indexOf(a);
        _xyz.attribution.splice(foo, 1);
      });
        
      attributionCheck();
        
      if (layer.L) _xyz.map.removeLayer(layer.L);
        
      if (layer.base) {
        _xyz.map.removeLayer(layer.base);
        layer.base = null;
      }

    };

    // Create control to toggle layer visibility.
    layer.clear_icon = layer_toggle(layer);
    
    // Create zoom to layer control
    if (layer.cntr || layer.bounds) {
      _xyz.utils.createElement({
        tag: 'i',
        options: {
          textContent: 'search',
          className: 'material-icons cursor noselect btn_header',
          title: 'Pan to layer'
        },
        appendTo: layer.header,
        eventListener: {
          event: 'click',
          funct: e => {
            e.stopPropagation();

            if (layer.display) {
              layer.bounds ?
                _xyz.map.flyToBounds(L.latLngBounds(layer.bounds)) :
                _xyz.map.panTo(L.latLng(layer.cntr));

              attributionCheck();

              _xyz.layersCheck();

            } else {
              return false;
            }
          }
        }
      });
    }

    //Add panel to layer control.
    layer_panels(layer);

    // Push hook for display:true layer (default).
    if (layer.display) {
      _xyz.utils.pushHook('layers', layer.layer);
      _xyz.attribution = _xyz.attribution.concat(layer.attribution || []);

      attributionCheck();
    }

    // get layer data.
    layer.getLayer(layer);
  });

};

function attributionCheck() {

  // get attribution links and check whether the className is in the attribution list.
  let links = document.querySelectorAll('.attribution > .links > a');

  for (let i = 0; i < links.length; ++i) {
    links[i].style.display = _xyz.attribution.indexOf(links[i].className) >= 0 ? 'inline-block' : 'none';
  }
}