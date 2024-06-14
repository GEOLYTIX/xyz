export default async (layer) => {

  layer.style ??= {}

  layer.style.mapType ??= 'roadmap'

  layer.zIndex ??= 0

  layer.L = new ol.layer.WebGLTile({
    source: new ol.source.Google({
      key: layer.apiKey,
      scale: 'scaleFactor2x',
      highDpi: true,
      mapType: layer.style.mapType,
      layerTypes: layer.style.layerTypes
    }),
    layer: layer,
    zIndex: layer.zIndex
  })

}
