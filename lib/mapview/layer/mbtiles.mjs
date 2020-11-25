export default _xyz => layer => {

  mapboxgl.accessToken = layer.accessToken

  layer.L =  new ol.layer.Layer({
    render: frameState => {

      if (!layer.display) return

      if (!layer.mbMap) {
        layer.mbMap = new mapboxgl.Map({
          container: _xyz.mapview.node,
          style: layer.mbStyle,
          attributionControl: false,
          boxZoom: false,
          doubleClickZoom: false,
          dragPan: false,
          dragRotate: false,
          interactive: false,
          keyboard: false,
          pitchWithRotate: false,
          scrollZoom: false,
          touchZoomRotate: false
        })
      }

      layer.canvas = layer.mbMap.getCanvas()

      layer.canvas.style.position = 'absolute'
    
      layer.canvas.style.display = layer.display && 'block' || 'none'
      
      // adjust view parameters in mapbox
      layer.mbMap.jumpTo({
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        animate: false
      })

      // cancel the scheduled update & trigger synchronous redraw
      if (layer.mbMap._frame) {
        layer.mbMap._frame.cancel()
        layer.mbMap._frame = null
      }

      layer.mbMap._render()

      if (!layer.resized) {
        layer.resized = true
        window.setTimeout(()=>layer.mbMap.resize(), 500)
      }

      return layer.canvas
    }
  })

}