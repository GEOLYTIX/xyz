export default _xyz => function() {

  const location = this;

  if (_xyz.hooks) _xyz.hooks.filter('locations', location.hook)

  _xyz.mapview.interaction.edit.finish && _xyz.mapview.interaction.edit.finish()

  if (location.view) {
    location.view.parentElement && location.view.parentElement.dispatchEvent(new Event('passover'))
    location.view.remove()
  }

  location.tabs && location.tabs.forEach(
    tab => tab.remove()
  )

  // Clear geometries and delete location to free up record.
  location.geometries.forEach(
    geom => _xyz.map.removeLayer(geom)
  )

  location.geometryCollection.forEach(
    geom => _xyz.map.removeLayer(geom)
  )

  if (location.Layer) _xyz.map.removeLayer(location.Layer)

  if (location.Marker) _xyz.map.removeLayer(location.Marker)

  if (typeof location.removeCallback === 'function') location.removeCallback()

  location.record.location = null
    
}