/**
### mapp.layer.formats.tiles()

@module /layer/formats/tiles
*/

export default layer => {

  layer.source ??= 'OSM'

  layer.projection ??= 'EPSG:3857'

  layer.L = new ol.layer.Tile({
    source: new ol.source[layer.source]({
      projection: layer.projection,
      url: decodeURIComponent(layer.URI),
      transition: 0
    }),
    layer: layer,
    zIndex: layer.style?.zIndex || 0
  })

}