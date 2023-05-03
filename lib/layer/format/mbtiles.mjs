let promise, maplibregl = null

async function MaplibreGL() {

  if (maplibregl) return new maplibregl.Map(...arguments);

  if (!promise) promise = new Promise(async resolve => {

    console.warn(`The mbtiles layer format uses an outdated version of the maplibre-gl library. Please change the format to maplibre`)

    Promise
      .all([
        import('https://cdn.skypack.dev/pin/maplibre-gl@v1.15.3-OFxGDsJNZ70P0Qa7CzNE/mode=imports,min/optimized/maplibre-gl.js')
      ])
      .then(imports => {
  
        maplibregl = imports[0]

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load MaplibreGL library. Please reload the browser.')
      })
  
  })

  await promise

  return new maplibregl.Map(...arguments);
}

export default async layer => {

  layer.container = mapp.utils.html.node`<div 
    class="mbtiles" 
    style="visibility: hidden; position: absolute; width: 100%; height: 100%;">`
  
  layer.mapview.Map.getTargetElement().prepend(layer.container)

  layer.Map = await MaplibreGL({
    container: layer.container,
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

      layer.container.style.visibility = 'visible';
      
      // adjust view parameters in mapbox
      layer.Map.jumpTo({
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        animate: false
      })

      return layer.container;
    }
  })

  // The Maplibre Map control must resize with mapview Map targetElement.
  layer.mapview.Map.getTargetElement().addEventListener('resize', ()=>layer.Map.resize())

}