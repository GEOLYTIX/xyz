export default _xyz => layer => {

  const maplibre = maplibregl || mapboxgl

  maplibre.accessToken = layer.accessToken

  const container = _xyz.utils.html.node`
  <div style="position: absolute; width: 100%; height: 100%;">`

  layer.mbMap = new maplibre.Map({
    container: container,
    style: layer.mbStyle,
    preserveDrawingBuffer: true,
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

  layer.L =  new ol.layer.Layer({
    render: frameState => {

      if (!layer.display) return
      
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

      return layer.mbMap.getContainer();
    }
  })

}