export default _xyz => {
  
  return {
    create: create
  }

  function create(params){

    this.node && this.node.remove()

    this.node = _xyz.utils.html.node`<div class="popup">`

    //this.node.addEventListener('mousemove', e => e.stopPropagation())
        
    this.node.appendChild(params.content)

    this.overlay && _xyz.map.removeOverlay(this.overlay)
  
    this.overlay = new ol.Overlay({
      element: this.node,
      position: params.coords || _xyz.mapview.position,
      positioning: 'bottom-center',
      autoPan: params.autoPan,
      insertFirst: true,
      autoPanAnimation: {
        duration: 250
      }
    })
  
    _xyz.map.addOverlay(this.overlay)
  }

}