export default async function (layers) {
  /**
   * Adds layer(s) to map
   * @param {Array} layers - array of layers to add
   * @returns {Array} - layers array
   */

  if (!Array.isArray(layers)) return;

  const layersSet = this.hooks && new Set(mapp.hooks.current.layers);

  for (let _layer of layers) {

    let layer = mapp.utils.clone(_layer);

    layer.mapview = this;

    // Only the layers in the layerset should be displayed.
    // Will override the layer.display setting from the workspace
    if (layersSet?.size) {
      layer.display = layersSet.has(layer.key);
    }

    // Check the layer format.
    if (!mapp.layer.formats[layer.format]) {
      console.warn(`${layer.key} layer format is unknown or undefined. This is likely due to an incorrect file path.`)
      continue;
    }

    await mapp.layer.decorate(layer);

    this.layers[layer.key] = layer;

    layer.display && layer.show();
  }

  return layers;
}