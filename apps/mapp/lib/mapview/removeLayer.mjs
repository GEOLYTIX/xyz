/**
## /mapview/removeLayer
The module exports the removeLayer method which is bound to the mapview.

@module /mapview/removeLayer
*/

/**
@function removeLayer
@description
The method will iterate of an array of layer or layer keys and will call the remove method of the referenced layer.

@param {(string|object|array)} layers A single layer key/object or an array of layer keys/objects to be removed from the mapview.
*/
export default function removeLayer(layers) {
  // Handle single layer input
  if (!Array.isArray(layers)) {
    layers = [layers];
  }

  for (const _layer of layers) {
    const layer = typeof _layer === 'string' ? this.layers[_layer] : _layer;

    layer.remove();
  }

  // Will resolve once the map has completed render
  this.renderComplete = new Promise((resolve) => {
    this.Map.once('rendercomplete', resolve);
  });
}
