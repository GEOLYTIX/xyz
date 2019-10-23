import polyStyle from './polyStyle.mjs';

import clusterStyle from './clusterStyle.mjs';

import _legends from './legend/_legends.mjs';

export default (_xyz, layer) => {

  const legends = _legends(_xyz);

  if (!layer.style) return;

  // Add style panel to layer dashboard.
  const panel = _xyz.utils.wire()`<div class="${'panel expandable ' + (layer.style.theme ? 'expanded': '')}">`;

  layer.view.dashboard.appendChild(panel);


  // Style panel header.
  const header = _xyz.utils.wire()`
  <div onclick=${e => {
    e.stopPropagation();

    _xyz.utils.toggleExpanderParent({
      expandable: panel,
      accordeon: true,
    });
  }}
  class="btn_text cursor noselect">Style`;

  panel.appendChild(header);


  if (layer.style.label) {
    panel.appendChild(_xyz.utils.wire()`
    <label class="checkbox" style="margin-bottom: 10px;">
    <input type="checkbox"
    checked=${!!layer.style.label.display}
    onchange=${e => {
      layer.style.label.display = e.target.checked;
      layer.show();
    }}></input><span>Display Labels.`);
  }


  layer.style.legend = _xyz.utils.wire()`<div class="legend">`;

  if(layer.style.theme){

    // Assign 'Basic' style entry to themes object.
    const themes = Object.assign({}, {"Basic": null}, layer.style.themes);

    // Create theme drop down
    panel.appendChild(_xyz.utils.wire()`<div>Select thematic style.`);

    panel.appendChild(_xyz.utils.dropdownCustom({
      entries: Object.keys(themes),
      singleSelect: true,
      selectedIndex: Object.keys(themes).length > 1 ? 1 : 0,
      callback: e => {
        
        e.target.parentNode.previousSibling.firstChild.textContent = e.target.dataset.field;

        layer.style.theme = themes[e.target.dataset.field];
      
        applyTheme(layer);
    
        layer.reload();
      }

    }));
  } 
    // Apply the current theme.
  applyTheme(layer); 

  panel.appendChild(layer.style.legend);

  if (layer.format === 'grid') legends.grid(layer);


  function applyTheme(layer) {

    // Empty legend.
    layer.style.legend.innerHTML = '';

    if(!layer.filter) layer.filter = {};
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