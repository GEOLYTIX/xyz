export default _xyz => function () {

  if (!_xyz.map) return

  const layer = this

  layer.display = true

  layer.view && layer.view.dispatchEvent(new CustomEvent('display-on'))

  layer.L && _xyz.map.removeLayer(layer.L)

  _xyz.map.addLayer(layer.L)

  if (layer.style && layer.style.label) {

    _xyz.map.getLayers().forEach(l => {
      l === layer.label && _xyz.map.removeLayer(layer.label)
    })

    layer.style.label.display && _xyz.map.addLayer(layer.label)
  }

  _xyz.mapview.attribution.check()

  // Push the layer into the layers hook array.
  _xyz.hooks && _xyz.hooks.push('layers', layer.key)

  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer()

  // Show tabs with display truthful.
  layer.tabs.forEach(tab => {
    tab.display && tab.show()
  })

}