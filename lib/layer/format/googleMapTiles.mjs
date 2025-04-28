export default async (layer) => {
  layer.style ??= {};

  layer.style.mapType ??= 'roadmap';

  layer.L = new ol.layer.WebGLTile({
    className: `mapp-layer-${layer.key}`,
    key: layer.key,
    source: new ol.source.Google({
      highDpi: true,
      key: layer.apiKey,
      layerTypes: layer.style.layerTypes,
      mapType: layer.style.mapType,
      scale: 'scaleFactor2x',
    }),
    zIndex: layer.zIndex,
  });
};
