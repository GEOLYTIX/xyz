export default _xyz => function () {

  const layer = this

  layer.display = false

  layer.view && layer.view.dispatchEvent(new CustomEvent('display-off'))

  layer.L && _xyz.map.removeLayer(layer.L)

  _xyz.mapview.attribution.check()

  // Filter the layer from the layers hook array.
  if (_xyz.hooks) _xyz.hooks.filter('layers', layer.key)

  // Check whether other group layers are visible.
  if (layer.group && _xyz.layers.listview.groups && _xyz.layers.listview.groups[layer.group]) _xyz.layers.listview.groups[layer.group].chkVisibleLayer()

  // Remove layer tabs.
  layer.tabs.forEach(tab => tab.remove())

}