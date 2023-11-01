const sources = {
  OSM: layer => new ol.source.OSM({
    url: decodeURIComponent(layer.URI),
    opaque: false,
    transition: 0,
  }),
  XYZ: layer => new ol.source.OSM({
    url: decodeURIComponent(layer.URI),
    opaque: false,
    transition: 0,
  })
}

export default layer => {

  layer.source ??= 'OSM'

  layer.L = new ol.layer.Tile({
    source: sources[layer.source](layer),
    layer: layer,
    zIndex: layer.style?.zIndex || 0
  })

}