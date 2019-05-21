import header from './header.mjs';

import dashboard from './dashboard.mjs';

export default _xyz => function () {

  const layer = this;

  (function update(){

    const view = {};

    layer.view = view;

    view.update = update;

    view.drawer = _xyz.utils.hyperHTML.wire()`<div class="drawer">`;
  
    header(_xyz, layer);
       
    // Create layer loader and append to drawer (after the header).
    view.loader = _xyz.utils.hyperHTML.wire()`<div class="loader">`;
    view.drawer.appendChild(view.loader);

    dashboard(_xyz, layer);
    
  })();

};