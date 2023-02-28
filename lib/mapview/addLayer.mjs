export default async function (layers) {
  /**
   * Adds layer(s) to map
   * @param {Array} layers - array of layers to add
   * @returns {Array} - layers array
   */

  if (!Array.isArray(layers)) return;

  const hooksExist = !!(this.hooks && mapp.hooks.current.layers.length);

  for (let _layer of layers) {

    let layer = mapp.utils.clone(_layer);

    layer.mapview = this;

    if (hooksExist) {
      layer.display = mapp.hooks.current.layers.indexOf(layer.key) >= 0; // -1 if not found
    }

    await mapp.layer.decorate(layer);

    this.layers[layer.key] = layer;

    layer.display && layer.show();
  }

  return layers;
}