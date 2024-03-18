/**
### mapp.layer.formats.tiles()

@module /layer/formats/tiles
*/

export default layer => {

  layer.source ??= 'OSM'

  layer.projection ??= 'EPSG:3857'

  layer.paramString ??= mapp.utils.paramString(layer.params)

  layer.L = new ol.layer.Tile({
    source: new ol.source[layer.source]({
      projection: layer.projection,
      url: layer.URI+layer.paramString,
      transition: 0
    }),
    layer: layer,
    zIndex: layer.style?.zIndex || 0
  })

}