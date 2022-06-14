export default function show() {

  this.display = false

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L)

  // Remove layer attribution from mapview attribution.
  this.mapview.attribution?.check()

  // Filter the layer from the layers hook array.
  this.mapview.hooks && mapp.hooks.filter('layers', this.key)

  // Execute hideCallbacks
  this.hideCallbacks?.forEach(fn => typeof fn === 'function' && fn(this))
}