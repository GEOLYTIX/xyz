import polyStyle from './polyStyle.mjs';

import clusterStyle from './clusterStyle.mjs';

export default (_xyz, layer) => {

  // Meaningful styles can only be set for vector and cluster objects.
  if (layer.format === 'grid' || layer.format === 'tiles') return;

  // Add style panel to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'panel expandable'
    },
    appendTo: layer.dashboard
  });

  // Style panel title / expander.
  _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_text cursor noselect',
      textContent: 'Style'
    },
    appendTo: panel,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();

        _xyz.utils.toggleExpanderParent({
          expandable: panel,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews,
        });
      }
    }
  });

  // Set layer theme to be the first theme defined in the workspace.
  layer.style.theme = Object.values(layer.style.themes)[0];

  if(layer.style.theme) panel.classList.add('expanded');

  // Assign 'Basic' style entry to themes object.
  const themes = Object.assign({},{ 'Basic': null }, layer.style.themes);

  // Create theme drop down
  _xyz.utils.dropdown({
    title: 'Select thematic style…',
    appendTo: panel,
    entries: themes,
    selected: Object.keys(layer.style.themes)[0],
    onchange: e => {

      // Set layer theme from themes object.
      layer.style.theme = themes[e.target.value];

      layer.loaded = false;

      applyTheme(layer);
      
    }
  });

  panel.appendChild(layer.style.legend);

  // Apply the current theme.
  applyTheme(layer);

  function applyTheme(layer) {

    // Empty legend.
    layer.style.legend.innerHTML = '';
  
    // Create / empty legend filter when theme is applied.
    layer.filter.legend = {};
  
    // Basic controls for cluster marker, default polygon and highlight.
    if (!layer.style.theme) {
  
      if (layer.style.marker) clusterStyle(_xyz, layer, layer.style.marker, 'Marker');
  
      if (layer.style.markerMulti) clusterStyle(_xyz, layer, layer.style.markerMulti, 'Marker (multi)');
  
      if (layer.style.default) polyStyle(_xyz, layer, layer.style.default, 'Polygon');
  
      if (layer.style.highlight) polyStyle(_xyz, layer, layer.style.highlight, 'Highlight');
  
      //return layer.get();

      return;
    }

    layer.style.setLegend(panel);
    
    
    //layer.get();
  
  }

};