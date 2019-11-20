import polyStyle from './polyStyle.mjs';

import clusterStyle from './clusterStyle.mjs';

import _legends from './legend/_legends.mjs';

export default (_xyz, layer) => {

  const legends = _legends(_xyz);

  if (!layer.style) return;

  // Add style panel to layer dashboard.
  const panel = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: `panel expandable ${layer.style.theme ? `expanded`: ``}`
    },
    appendTo: layer.view.dashboard
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
          scrolly: _xyz.desktop && _xyz.desktop.listviews
        });
      }
    }
  });

  layer.style.legend = _xyz.utils.wire()`<div class="legend">`;


  if (layer.style.themes) themeDropdown(layer);
   

  panel.appendChild(layer.style.legend);

  if (layer.format === 'grid') legends.grid(layer);

  
  function themeDropdown(layer) {

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

        layer.get();
      
      }
    });

    // Apply the current theme.
    applyTheme(layer);
  }

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

      return;
    }

    setLegend();
  
  }

  function setLegend() {
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'categorized') legends.polyCategorized(layer);
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'graduated') legends.polyGraduated(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'categorized') legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'competition') legends.clusterCategorized(layer);
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'graduated') legends.clusterGraduated(layer);
  
  }

};