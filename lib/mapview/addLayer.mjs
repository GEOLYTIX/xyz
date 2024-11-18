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

A structuredClone of the JSON layer will be merged into a clone of the locale.layer template to be decorated and assigned to the mapview [this] layers.

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
    layers = [layers]
  }

  // A set of the layers is required in order to control the display based on URL params [hooks]
  const layersSet = this.hooks && new Set(mapp.hooks.current.layers);

  const decoratedLayers = []

  for (let i = 0; i < layers.length; i++) {

    // The JSON layer is merged into the locale.layer
    const layer = mapp.utils.merge({},
      structuredClone(this.locale.layer || {}),
      structuredClone(layers[i]))

    // The layer.err is an array of errors from failing to retrieve templates asscoiated with a layer.
    layer.err && console.error(layer.err)
   
    // A default zIndex is assigned from the loop index to ensure layers are drawn in the order without an implicit zIndex.
    layer.zIndex ??= i

    layer.mapview = this;

    // Only the layers in the layerset should be displayed.
    // Will override the layer.display setting from the workspace
    if (layersSet?.size) {
      layer.display = layersSet.has(layer.key);
    }

    // Layer without format should not be decorated.
    if (!layer.format) continue;

    // Assign default key if not explicit in layer JSON.
    layer.key ??= `${layer.format}-${i}`

    // Check the layer format.
    if (!mapp.layer.formats[layer.format]) {
      console.error(`Layer: ${layer.key}; Format: ${layer.format} is unknown.`)
      continue;
    }

    await mapp.layer.decorate(layer);

    if (!layer.L) continue;

    // Assign layer to array returned from method.
    decoratedLayers.push(layer)

    this.layers[layer.key] = layer;

    layer.display && layer.show();
  }

  // Will resolve once the map has completed render.
  this.renderComplete = new Promise(resolve => {

    this.Map.once('rendercomplete', resolve)
  })

  return decoratedLayers;
}
