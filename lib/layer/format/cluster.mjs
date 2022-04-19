export default layer => {

  layer.highlight = true

  layer.reload = loader

  function loader () {

    if (!layer.display) return;

    if (layer.xhr) layer.xhr.abort()

    const tableZ = layer.tableCurrent()

    if (!tableZ) {
      layer.L.getSource().clear()
      return;
    }

    const extent = ol.proj.transformExtent(
      layer.mapview.Map.getView().calculateExtent(layer.mapview.Map.getSize()),
      `EPSG:${layer.mapview.srid}`,
      `EPSG:${layer.srid}`)

    layer.xhr = new XMLHttpRequest()

    layer.xhr.open(
      "GET",
      `${layer.mapview.host}/api/layer/cluster/${layer.mapview.Map.getView().getZoom()}?` +
        mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: tableZ,
          kmeans: layer.cluster_kmeans || undefined,
          dbscan: layer.cluster_dbscan || undefined,
          resolution: layer.cluster_resolution || undefined,
          hexgrid: layer.cluster_hexgrid,
          theme: layer.style.theme?.type,
          size: layer.style.theme?.size,
          cat: layer.style.theme?.fieldfx || layer.style.theme?.field,
          aggregate: layer.style.theme?.aggregate,
          label: layer.style.label?.field,
          label_template: layer.style.label?.template,
          filter: layer.filter?.current,
          viewport: [extent[0], extent[1], extent[2], extent[3]],
        })
    );

    layer.xhr.setRequestHeader('Content-Type', 'application/json')
    layer.xhr.responseType = 'json'

    // Draw layer on load event.
    layer.xhr.onload = e => {
  
      if (e.target.status !== 200) return;

      const cluster = e.target.response

      layer.max_size = cluster.reduce((max_size, f) => Math.max(max_size, f.properties.size || f.properties.count), 0)
    
      let id = 1
    
      const features = cluster.map(f => new ol.Feature(Object.assign({
        id: id++,
        geometry: new ol.geom.Point(
          layer.srid == 4326 && ol.proj.fromLonLat([f.geometry.x, f.geometry.y]) || [f.geometry.x, f.geometry.y]
        ),
      },f.properties)))

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
    style: mapp.layer.style(layer)
  })

  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', loader)
}