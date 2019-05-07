import filters from './panel/filters/_filters.mjs';

import style from './panel/style/_styles.mjs';

import draw from './panel/draw.mjs';

import cluster from './panel/cluster.mjs';

import table from './panel/table.mjs';

import report from './panel/report.mjs';

export default (_xyz, layer) => {

  const dashboard = _xyz.utils.hyperHTML.wire()`
    <div class="dashboard">`;

  layer.view.dashboard = dashboard;

  layer.view.drawer.appendChild(dashboard);

  // Create layer meta.
  if (layer.meta) {
    const meta = _xyz.utils.hyperHTML.wire()`
            <p class="meta">`;
    meta.innerHTML = layer.meta;
    dashboard.appendChild(meta);
  }
  
  report(_xyz, layer);

  draw(_xyz, layer);
    
  table(_xyz, layer);
    
  cluster(_xyz, layer);
   
  filters(_xyz, layer);
    
  style(_xyz, layer);
    
  // Add dashboard if it contains panel.
  if (dashboard.children.length > 0) {
    
    layer.view.header.classList.add('pane_shadow');
    layer.view.drawer.classList.add('expandable');
    
    // Expander control for layer drawer.
    layer.view.header.addEventListener('click', () => {
      _xyz.utils.toggleExpanderParent({
        expandable: layer.view.drawer,
        accordeon: true,
        scrolly: _xyz.desktop && _xyz.desktop.listviews,
      });
    });

    const expander = _xyz.utils.hyperHTML.wire()`
    <i
    title="Toggle layer dashboard"
    class="material-icons cursor noselect btn_header expander">`;

    layer.view.header.appendChild(expander);
  
    expander.onclick = e => {
      e.stopPropagation();
      _xyz.utils.toggleExpanderParent({
        expandable: layer.view.drawer,
        scrolly: _xyz.desktop && _xyz.desktop.listviews,
      });
    };
    
  }
  
};