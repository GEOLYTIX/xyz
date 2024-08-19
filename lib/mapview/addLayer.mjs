/**
## Mapview.addLayer()

@module /mapview/addLayer
*/

export default async function (layers) {

  if (!Array.isArray(layers)) return;

  const layersSet = this.hooks && new Set(mapp.hooks.current.layers);

  for (let i = 0; i < layers.length; i++) {

    const layer = mapp.utils.merge({}, this.locale.layer || {}, layers[i])

    // The layer.err will be assigned from a failure to fetch a layer template.
    if (layer.err) {
      // If its not an array, make it one.
      if (!Array.isArray(layer.err)) layer.err = [layer.err]
      
      // Error for each of the array items.
      layer.err.forEach(err => console.error(err))
    }

    layer.zIndex ??= i

    layer.mapview = this;

    // Only the layers in the layerset should be displayed.
    // Will override the layer.display setting from the workspace
    if (layersSet?.size) {
      layer.display = layersSet.has(layer.key);
    }

    // Layer without format should not be decorated.
    if (!layer.format) continue;

    // Check the layer format.
    if (!mapp.layer.formats[layer.format]) {
      console.error(`Layer: ${layer.key}; Format: ${layer.format} is unknown.`)
      continue;
    }

    await mapp.layer.decorate(layer);

    if (!layer.L) continue;

    this.layers[layer.key] = layer;

    layer.display && layer.show();
  }

  // Will resolve once the map has completed render.
  this.renderComplete = new Promise(resolve => {

    this.Map.once('rendercomplete', resolve)
  })

  return layers;
}