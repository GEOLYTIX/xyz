export default layer => {

  const url = layer.proxy
    && `${layer.mapview.host}/api/proxy?url=${layer.URI}`
    || layer.URI

  const source = new ol.source.OSM({
    url: decodeURIComponent(url),
    opaque: false,
    transition: 0,
  })

  layer.L = new ol.layer.Tile({
    source: source,
    layer: layer,
    zIndex: layer.style.zIndex || 0
  })

}