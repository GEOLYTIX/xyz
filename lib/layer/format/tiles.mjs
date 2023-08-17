export default layer => {

  layer.L = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: decodeURIComponent(layer.URI),
      opaque: false,
      transition: 0,
    }),
    layer: layer,
    zIndex: layer.style?.zIndex || 0
  })

}