export default _xyz => {
  
  return {
    create: create
  };

  function create(params){

    this.node && this.node.remove();

    this.node = _xyz.utils.wire()`<div class="popup">`;
  
    this.node.addEventListener('mousemove', e => e.stopPropagation());

    const content = _xyz.utils.wire()`<div>`
    
    content.appendChild(params.content);
        
    this.node.appendChild(content);

    if (this.overlay) _xyz.map.removeOverlay(this.overlay);
  
    this.overlay = new _xyz.mapview.lib.Overlay({
      element: this.node,
      positioning: 'bottom-center',
      autoPan: true,
      //stopEvent: true,
      autoPanAnimation: {
        duration: 250
      }
    });
  
    _xyz.map.addOverlay(this.overlay);
  
    this.overlay.setPosition(params.coords);
  };

};