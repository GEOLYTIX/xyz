export default _xyz => {
  
  return {
    create: create
  };

  function create(params){

    this.node = _xyz.utils.wire()`<div class="popup">`;
  
    this.node.onmousemove = e => e.stopPropagation();
    
    this.node.appendChild(params.content);
  
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