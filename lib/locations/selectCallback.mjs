export default _xyz => location => {

  // Create location view. 
  _xyz.locations.view.create(location)

  location.draw()

  // Create an alert with the locations infoj if mapview popup is not defined.
  if (!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '))


  // Create popup if listview is not available.
  if (!_xyz.locations.listview.node) {

    location.view.style.width = '300px'

    _xyz.mapview.popup.create({
      coords: location.marker,
      content: location.view,
      autoPan: true
    })

    return
  }

  // Draw location marker.
  location.Marker = _xyz.mapview.geoJSON({
    geometry: {
      type: 'Point',
      coordinates: location.marker,
    },
    zIndex: 2000,
    style: new ol.style.Style({
      image: _xyz.mapview.icon({
        type: 'markerLetter',
        letter: String.fromCharCode(65 + _xyz.locations.list.indexOf(location.record)),
        color: location.style.strokeColor,
        scale: 3,
        anchor: [0.5, 1]
      })
    })
  })

  if (location._flyTo) location.flyTo()

  return _xyz.locations.listview.add(location)
}