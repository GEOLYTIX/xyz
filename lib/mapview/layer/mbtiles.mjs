export default _xyz => layer => {

  mapboxgl.accessToken = layer.accessToken

  const mbMap = new mapboxgl.Map({
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

  layer.canvas = mbMap.getCanvas()

  layer.canvas.style.position = 'absolute'

  console.log(layer.style.zIndex || Object.keys(_xyz.layers.list).findIndex(key => key === layer.key))

  layer.canvas.style.display = layer.display && 'block' || 'none'

  layer.L =  new ol.layer.Layer({
    render: frameState => {

      layer.canvas.style.display = layer.display && 'block' || 'none'

      if (!layer.display) return

      // adjust view parameters in mapbox
      mbMap.jumpTo({
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        animate: false
      })

      // cancel the scheduled update & trigger synchronous redraw
      if (mbMap._frame) {
        mbMap._frame.cancel()
        mbMap._frame = null
      }
      mbMap._render()

      return layer.canvas
    }
  })

}