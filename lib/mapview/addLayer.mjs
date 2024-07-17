/**
## Mapview.addLayer()

@module /mapview/addLayer
*/

export default async function (layers) {

  if (!Array.isArray(layers)) return;

  const layersSet = this.hooks && new Set(mapp.hooks.current.layers);

  for (let i = 0; i < layers.length; i++) {

    const layer = mapp.utils.merge({}, this.locale.layer || {}, layers[i])

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
      console.error(`Layer: ${layer.key}, format is unknown or undefined. This is likely due to an incorrect file path.`)
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