/**
## /mapview/addLayer

The module exports the addLayer method which is bound to the mapview.

@module /mapview/addLayer
*/

/**
@function addLayer

@description
A single or an array of JSON layer can be added to the mapview with the addLayer method.

A default zIndex is assigned to layer without an implicit zIndex.

The mapview [this] to which the addLayer method is bound will be assigned to the layer object.

A layer with a valid format property will be decorated and added to the mapview.layers{} object.

Layer with a display flag will shown in the mapview.

A renderComplete event will be assigned to the Openlayers mapview.Map{}. This promise will resolve once after all layer to be shown in the addLayer method have completed their render.

@param {object} layers A single JSON layer or an array of JSON layer to be added to the mapview.

@returns {array} The array of decorated layers is returned.
*/
export default async function addLayer(layers) {
  // A single JSON layer is provided.
  if (layers instanceof Object && !Array.isArray(layers)) {
    // Create array of layers with single JSON layer.
    layers = [layers];
  }

  // A set of the layers is required in order to control the display based on URL params [hooks]
  const currentLayers = this.hooks && new Set(mapp.hooks.current.layers);

  // Create clone layers NOT to modify the original JSON layer.
  layers = structuredClone(layers);

  this.zIndex ??= 1;

  for (const layer of layers) {
    // The layer.err is an array of errors from failing to retrieve templates asscoiated with a layer.
    layer.err && console.error(layer.err);

    // An increasing zIndex is assigned to layer without implicit zIndex to ensure that layers added later are drawn on top.
    layer.zIndex ??= this.zIndex++;

    layer.mapview = this;

    // currentLayers as defined through the layers array URL parameter will be displayed.
    if (currentLayers?.size) {
      layer.display = currentLayers.has(layer.key);
    }

    await mapp.layer.decorate(layer);

    if (!layer.L) continue;

    this.layers[layer.key] = layer;

    layer.display && layer.show();
  }

  // Will resolve once the map has completed render.
  this.renderComplete = new Promise((resolve) => {
    this.Map.once('rendercomplete', resolve);
  });

  return layers;
}
