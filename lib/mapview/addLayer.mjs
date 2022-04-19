export default function (layers) {

  if (!Array.isArray(layers)) return;

  let hooks = (this.hooks && mapp.hooks.current.layers.length)

  layers.forEach((_layer, i) => {

    let layer = mapp.utils.clone(_layer);

    layer.mapview = this

    if (hooks) {
      layer.display = !!~mapp.hooks.current.layers.indexOf(layer.key)
    }

    mapp.layer.decorate(layer)

    this.layers[layer.key] = layer

    layer.display && layer.show()
  })

  return layers
}