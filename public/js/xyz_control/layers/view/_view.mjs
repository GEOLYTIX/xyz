import header from './header.mjs';

import dashboard from './dashboard.mjs';

export default _xyz => layer => {

  layer.view.drawer = _xyz.utils.wire()`<div class="drawer">`;
  
  layer.view.header = header(_xyz, layer);

  layer.view.drawer.appendChild(layer.view.header);
       
  layer.view.drawer.appendChild(layer.view.loader);

  dashboard(_xyz, layer);

  // Make the layer view opaque if no table is available for the current zoom level.
  if (layer.tables) _xyz.mapview.node.addEventListener('changeEnd', () => {
    layer.view.drawer.style.opacity = !layer.tableCurrent() ? 0.4 : 1;
  });
    
};