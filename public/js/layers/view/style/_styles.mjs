import polyStyle from './polyStyle.mjs';

import clusterStyle from './clusterStyle.mjs';

import legend from './legend/_legend.mjs';

export default _xyz => {

  const style = {

    panel: panel,

    legend: legend(_xyz),

    polyStyle: polyStyle(_xyz),

    clusterStyle: clusterStyle(_xyz),

  };

  return style;

  function panel(layer) {

    if (!layer.style) return;

    if (!layer.style.theme && layer.style.hidden) return;
  
    const panel = _xyz.utils.wire()`
    <div class="drawer panel expandable ${layer.style.theme || layer.format === 'grid' ? 'expanded' : ''}">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>Style</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);
  
    // Add toggle for label layer.
    layer.style.label && panel.appendChild(_xyz.utils.wire()`
    <label class="input-checkbox" style="margin-bottom: 10px;">
    <input type="checkbox"
      checked=${!!layer.style.label.display}
      onchange=${e => {
        layer.style.label.display = e.target.checked;
        layer.show();
      }}>
    </input>
    <div></div><span>Display Labels.`);

    layer.style.bringToFront = _xyz.utils.wire()`<button 
      title="Bring layer to front." 
      class="btn-wide primary-colour"
      onclick=${e => layer.bringToFront()
      }>Bring layer to front`;

    layer.style.bringToFront.disabled = !layer.display;

    //panel.appendChild(layer.style.bringToFront);
  
    // Add theme control
    if(layer.style.theme && !layer.style.hidden){

      // Assign 'Basic' style entry to themes object.
      const themes = Object.assign({"Basic": null}, layer.style.themes);
  
      panel.appendChild(_xyz.utils.wire()`<div>Select thematic style.`);
  
      panel.appendChild(_xyz.utils.wire()`
      <button class="btn-drop">
      <div
        class="head"
        onclick=${e => {
          e.preventDefault();
          e.target.parentElement.classList.toggle('active');
        }}>
        <span>${Object.keys(themes)[1]}</span>
        <div class="icon"></div>
      </div>
      <ul>
        ${Object.keys(themes).map(
          key => _xyz.utils.wire()`
          <li onclick=${e=>{
            const drop = e.target.closest('.btn-drop');
            drop.querySelector(':first-child').textContent = key;
            drop.classList.toggle('active');
            layer.style.theme = themes[key];
            applyTheme(layer);
            layer.reload();
          }}>${key}`)}`);
            
    }

    if (layer.style.theme && layer.style.themes && layer.style.hidden) {
      panel.appendChild(_xyz.utils.wire()`<span style="font-weight: bold;">${Object.keys(layer.style.themes)[0]}`)
    }

    // Allow hide all from legend
    panel.appendChild(_xyz.utils.wire()`
      <div class="switch-all" style="font-size: 90%; display:none;">Click on labels to switch visibity or 
      <a class="primary-colour" style="cursor: pointer;"
      onclick=${e => {
        e.stopPropagation();

        layer.style.theme.hideAll = layer.style.theme.hideAll ? false : true; // control flag

        if(!layer.filter.legend[layer.style.theme.field]) layer.filter.legend[layer.style.theme.field] = {};

        layer.filter.legend[layer.style.theme.field].ni = []; // set initial values for filters
        layer.filter.legend[layer.style.theme.field].in = [];

        if(layer.style.theme.hideAll) { // apply all exclusions

          Object.keys(layer.style.theme.cat).map(c => layer.filter.legend[layer.style.theme.field].ni.push(c));
          layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
            
        }
        // count nodes to update excluding 'Multiple locations on cluster layers
        let childNodes = layer.format === 'cluster' ? e.target.parentElement.nextSibling.children.length - 2 : e.target.parentElement.nextSibling.children.length;

        for(let i = 0; i < childNodes; i++){ // apply styling
          e.target.parentElement.nextSibling.children[i].style.textDecoration = layer.style.theme.hideAll ? 'line-through' : 'none';
          e.target.parentElement.nextSibling.children[i].style.opacity = layer.style.theme.hideAll ? 0.8 : 1;
          e.target.parentElement.nextSibling.children[i].style.fillOpacity = layer.style.theme.hideAll ? 0.8 : 1;
        }

        layer.reload(); // reload layer

    }}>switch all</a>.`);

    
    // Apply the current theme.
    applyTheme(layer); 

    panel.appendChild(layer.style.bringToFront);
  
    return panel;
  
    function applyTheme(layer) {
      // enable or hide 'switch all' filter.
      panel.querySelector('.switch-all').style.display = layer.style.theme && layer.style.theme.type === 'categorized' ? 'block' : 'none';
  
      // Empty legend.
      layer.style.legend && layer.style.legend.remove();
  
      if (layer.style.theme || layer.format === 'grid') return panel.appendChild(_xyz.layers.view.style.legend(layer));
  
      layer.style.legend = _xyz.utils.wire()`<div class="legend">`;
  
      layer.style.marker && style.clusterStyle(layer, layer.style.marker, 'Marker');
  
      layer.style.markerMulti && style.clusterStyle(layer, layer.style.markerMulti, 'MultiMarker');
  
      layer.style.default && style.polyStyle(layer, layer.style.default, 'Polygon');
  
      layer.style.highlight && style.polyStyle(layer, layer.style.highlight, 'Highlight');
  
      panel.appendChild(layer.style.legend);
  
    }
  
  };

}