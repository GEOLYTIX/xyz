/**
## /layer/formats/googleMapTiles

The module exports the "googleMapTiles" format method for the Mapp layer decorator method.

@module /layer/formats/googleMapTiles
*/

/**
@function googleMapTiles
@async
@description
The format method assigns an Openlayers [layer/WebGLTile]{@link https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLTile-WebGLTileLayer.html} class object as L property to the Mapp layer object.
   
@param {layer} layer The layer object.
*/
export default async function googleMapTiles(layer) {
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
}
