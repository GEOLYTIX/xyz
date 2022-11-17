let promise

export default async layer => {

  if (!promise) promise = new Promise(async resolve => {

    const loader = new google.maps.plugins.loader.Loader({
      apiKey: layer.apiKey,
      version: "weekly",
    });

    await loader.load()

    resolve()
  
  })

  await promise

  const container = mapp.utils.html.node`
    <div style="position: absolute; width: 100%; height: 100%; transition: opacity .25s ease-in-out;">`

  layer.gmap = new google.maps.Map(container, {
    disableDefaultUI: true,
    keyboardShortcuts: false,
    draggable: false,
    disableDoubleClickZoom: true,
    scrollwheel: false,
    streetViewControl: false,
  });

  let timeout, zoom;

  layer.L =  new ol.layer.Layer({
    zIndex: 0,
    render: frameState => {

      if (!layer.display) return

      if (zoom !== frameState.viewState.zoom) container.style.opacity = 0;

      zoom = frameState.viewState.zoom

      var center = ol.proj.toLonLat(frameState.viewState.center);

      layer.gmap.setCenter({lat: center[1], lng: center[0]})
      layer.gmap.setZoom(frameState.viewState.zoom);

      timeout && clearTimeout(timeout)

      timeout = setTimeout(()=>{container.style.opacity = 1;}, 400)

      return container
    }
  })

}