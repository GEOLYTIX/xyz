export default layer => {

  layer.highlight = true

  layer.reload = loader

  // Assign legacy cluster properties to cluster config object.
  layer.cluster = Object.assign({
    label: layer.cluster_label,
    kmeans: layer.cluster_kmeans,
    dbscan: layer.cluster_dbscan,
    resolution: layer.cluster_resolution,
    hexgrid: layer.cluster_hexgrid
  }, layer.cluster || {})

  // If legacy cluster properties are set, provide warning to update. 
  if (layer.cluster_label || layer.cluster_kmeans || layer.cluster_dbscan || layer.cluster_resolution || layer.cluster_hexgrid) {
    console.warn(`Layer ${layer.key} is using legacy cluster properties. Please update to use cluster:{} config object.`)
  }  

  function loader () {

    if (!layer.display) return;

    layer.mapview.popup(null)

    if (layer.xhr) layer.xhr.abort()

    const tableZ = layer.tableCurrent()

    if (!tableZ) {
      layer.L?.getSource()?.clear()
      return;
    }

    const extent = ol.proj.transformExtent(
      layer.mapview.Map.getView().calculateExtent(layer.mapview.Map.getSize()),
      `EPSG:${layer.mapview.srid}`,
      `EPSG:${layer.srid}`)

    let z = layer.mapview.Map.getView().getZoom()

    layer.xhr = new XMLHttpRequest()

    layer.xhr.open(
      'GET',
      `${layer.mapview.host}/api/layer/cluster?` +
        mapp.utils.paramString({
          z,
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: tableZ,
          resolution: layer.cluster.resolution || undefined,
          hexgrid: layer.cluster.hexgrid,
          cat: layer.style.theme?.field,
          aggregate: layer.style.theme?.aggregate || layer.style.theme?.type === 'graduated' && 'sum',
          label: layer.style.label?.field,
          filter: layer.filter?.current,
          viewport: layer.cluster.viewportLimit >= z ?
            undefined : [extent[0], extent[1], extent[2], extent[3]],
        })
    );

    layer.xhr.setRequestHeader('Content-Type', 'application/json')
    layer.xhr.responseType = 'json'

    // Draw layer on load event.
    layer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;

      if (!e.target.response) return;

      layer.max_size = e.target.response.reduce((max_size, f) => Math.max(max_size, f.properties.size || f.properties.count), 0)
        
      const features = e.target.response.map((f,i) => new ol.Feature(Object.assign({
        id: `_${i+1}`,
        geometry: new ol.geom.Point(
          layer.srid == 4326 && ol.proj.fromLonLat(f.geometry) || f.geometry
        ),
      },f.properties)))

      layer.renderCount = 0

      layer.L.setSource(new ol.source.Vector({
        useSpatialIndex: false,
        features: features,
      }))
    }

    layer.xhr.send()
  }
   
  layer.L = new ol.layer.Vector({
    key: layer.key,
    layer: layer,
    zIndex: layer.style.zIndex || 10,
    style: mapp.layer.Style(layer)
  })

  if (layer.debug) {

    layer.L.on('prerender',()=>{
      console.log(`${layer.key} - prerender ${layer.renderCount++}`)
    })
  
    layer.L.on('postrender',()=>{
      console.log(`${layer.key} - postrender ${layer.renderCount++}`)
    })
  }

  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', loader)
}