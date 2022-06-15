let promise, mapboxgl = null

async function MapboxGL() {

  // Return Chart method if defined.
  if (mapboxgl) return new mapboxgl.Map(...arguments);

  // Create promise to load Chart library.
  if (!promise) promise = new Promise(async resolve => {

    // Assign from window if Chart library is loaded from link
    if (window.mapboxgl) {

      mapboxgl = window.mapboxgl

      resolve()
  
      return
    }

    // Import Chart and plugins.
    Promise
      .all([
        import('https://cdn.skypack.dev/pin/mapbox-gl@v2.8.2-2X0QssQ9YYqMIe57RkqH/mode=imports,min/optimized/mapbox-gl.js')
      ])
      .then(imports => {
  
        mapboxgl = imports[0]

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load MapboxGL library. Please reload the browser.')
      })
  
  })

  await promise

  return new mapboxgl.Map(...arguments);
}

export default async layer => {

  const container = mapp.utils.html.node`
    <div style="position: absolute; width: 100%; height: 100%;">`

  layer.mbMap = await MapboxGL({
    accessToken: layer.accessToken,
    container: container,
    style: layer.mbStyle,
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