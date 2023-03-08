let promise, mapboxgl = null

async function MapboxGL() {

  if (mapboxgl) return new mapboxgl.Map(...arguments);

  if (!promise) promise = new Promise(async resolve => {

    if (window.mapboxgl) {

      mapboxgl = window.mapboxgl

      resolve()
  
      return
    }

    Promise
      .all([
        import('https://cdn.skypack.dev/pin/mapbox-gl@v2.13.0-GHIh2G0Ia91uxko29Aio/mode=imports,min/optimized/mapbox-gl.js')
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

  layer.container = layer.mapview.Map.getTarget().appendChild(mapp.utils.html.node`
    <div class="mapboxgl" style="position: absolute; width: 100%; height: 100%;">`)

  layer.Map = await MapboxGL({
    accessToken: layer.accessToken,
    container: layer.container,
    style: layer.style.URL,
    projection: 'mercator'
  });

  layer.L =  new ol.layer.Layer({
    zIndex: layer.zIndex || 0,
    render: frameState => {

      if (!layer.display) return

      //adjust view parameters in mapbox
      layer.Map.jumpTo({
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        animate: false
      })

      return layer.container;
    }
  })

}