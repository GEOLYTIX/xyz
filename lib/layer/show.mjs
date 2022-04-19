export default function show() {

  this.display = true

  // Dispatch display change event on the layer view.
  this.view?.dispatchEvent(new Event('displayTrue'))

  // Remove OL layer from mapview.
  this.mapview.Map.removeLayer(this.L)

  // Add OL layer to mapview.
  this.mapview.Map.addLayer(this.L)

  typeof this.reload === 'function' && this.reload()

  // Add layer attribution to mapview attribution.
  this.mapview.attribution?.check()

  // Push the layer into the layers hook array.
  this.mapview.hooks && mapp.hooks.push('layers', this.key)
}