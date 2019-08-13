import header from './header.mjs';

import dashboard from './dashboard.mjs';

export default _xyz => layer => {

  layer.view.drawer = _xyz.utils.wire()`<div class="drawer">`;
  
  header(_xyz, layer);
       
  //layer.view.loader = _xyz.utils.wire()`<div class="loader">`;
  layer.view.drawer.appendChild(layer.view.loader);

  dashboard(_xyz, layer);

  if (layer.tables) _xyz.mapview.node.addEventListener('changeEnd', () => {
    layer.view.drawer.style.opacity = !layer.tableCurrent() ? 0.4 : 1;
  });
    
};