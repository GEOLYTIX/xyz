// let maplibregl = null

// async function dynamicImport() {

//   if (window.maplibregl) {

//     maplibregl = window.maplibregl

//     return;
//   }

//   maplibregl = await import('https://cdn.skypack.dev/pin/maplibre-gl@v1.15.2-vB8RUOzTJK9WkLajH5fD/mode=imports,min/optimized/maplibre-gl.js')
// }

// async function maplibreglMap() {

//   if (!maplibregl) await dynamicImport()

//   return new maplibregl.Map(...arguments);
// }

import maplibregl from 'https://cdn.skypack.dev/pin/maplibre-gl@v1.15.2-vB8RUOzTJK9WkLajH5fD/mode=imports,min/optimized/maplibre-gl.js';

export default layer => {

  const container = mapp.utils.html.node`
    <div style="position: absolute; width: 100%; height: 100%;">`

  layer.mbMap = new maplibregl.Map({
    container: container,
    style: layer.mbStyle,
    accessToken: layer.accessToken,
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragPan: false,
    dragRotate: false,
    interactive: false,
    keyboard: false,
    pitchWithRotate: false,
    scrollZoom: false,
    touchZoomRotate: false,
    preserveDrawingBuffer: layer.preserveDrawingBuffer
  });

  layer.L =  new ol.layer.Layer({
    zIndex: layer.zIndex || 0,
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