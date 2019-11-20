import style from './style/_styles.mjs';

import filter from './filter/_filter.mjs';

import draw from './draw/_draw.mjs';

import data from './data.mjs';

import report from './report.mjs';

export default _xyz => {

  const view = {

    create: create,

    style: style(_xyz),

    filter: filter(_xyz),

    draw: draw(_xyz),

    report: report(_xyz),

    data: data(_xyz),

  };

  return view;

  
  function create(layer) {

    layer.view = _xyz.utils.wire()`<div class="drawer layer-view">`;

    // Make the layer view opaque if no table is available for the current zoom level.
    if (layer.tables) _xyz.mapview.node.addEventListener('changeEnd', () => {
        !layer.tableCurrent() ? layer.view.classList.add('disabled') : layer.view.classList.remove('disabled');
    });
    
    const header = _xyz.utils.wire()`
    <div class="header enabled"><span>${layer.name || layer.key}`;
  
    // Add symbol to layer header.
    if (layer.format === 'cluster' && layer.style.marker) {
    
      header.appendChild(_xyz.utils.wire()`
      <img
        class="btn-header"
        title="Default icon"
        style="float: right; cursor: help;"
        src="${_xyz.utils.svg_symbols(layer.style.marker)}">`);
    }
  
    header.appendChild(_xyz.utils.wire()`
    <button
      title="Zoom to filtered layer extent"
      class="btn-header xyz-icon icon-fullscreen"
      onclick=${e=>{
        e.stopPropagation();
        layer.zoomToExtent();
      }}>`);
   
    header.toggleDisplay = _xyz.utils.wire()`
    <button
      title="Toggle visibility"
      class="${'btn-header xyz-icon icon-toggle ' + (layer.display && 'on')}"
      onclick=${e=>{
        e.stopPropagation();
             
        layer.display?
            layer.remove():
            layer.show();
      
      }}>`;
  
    header.appendChild(header.toggleDisplay);

    layer.view.addEventListener('toggleDisplay', 
        ()=>header.toggleDisplay.classList.toggle('on'));
  
    layer.view.appendChild(header);

    // Create layer meta.
    if (layer.meta) {
        const meta = _xyz.utils.wire()`<p class="meta">`;
        meta.innerHTML = layer.meta;
        layer.view.appendChild(meta);
    }

    // Create & add Style panel.
    const style_panel = view.style.panel(layer);
    style_panel && layer.view.appendChild(style_panel);

    // Create & add Filter panel.
    const filter_panel = view.filter.panel(layer);
    filter_panel && layer.view.appendChild(filter_panel);

    // Create & add Data panel.
    const data_panel = view.data.panel(layer);
    data_panel && layer.view.appendChild(data_panel);

    // Create & add Draw panel.
    const draw_panel = view.draw.panel(layer);
    draw_panel && layer.view.appendChild(draw_panel);
        
    // Create & add Reports panel.
    const report_panel = view.report.panel(layer);
    report_panel && layer.view.appendChild(report_panel);

    if (layer.view.children.length <= 1) return;

    layer.view.classList.add('expandable');

    // Expander control for layer drawer.
    header.onclick = e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
    };

    header.appendChild(_xyz.utils.wire()`
    <button
      title="Toggle layer dashboard"
      class="btn-header xyz-icon icon-expander"
      onclick=${e=>{
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target);
      }}>`);

    const firstPanel = layer.view.querySelector('.panel');

    //firstPanel && firstPanel.classList.add('expanded');

  }

}