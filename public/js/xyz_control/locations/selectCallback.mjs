export default _xyz => location => {

  // Create location view.
  location.view();

  location.draw();

  // Draw location to map. Point locations have no style and are invisible.
  // location.Layer = _xyz.mapview.geoJSON({
  //   geometry: location.geometry,
  //   style: [
  //     new _xyz.mapview.lib.style.Style({
  //       stroke: new _xyz.mapview.lib.style.Stroke({
  //         color: 'rgba(255, 255, 255, 0.2)',
  //         width: 8
  //       }),
  //     }),
  //     new _xyz.mapview.lib.style.Style({
  //       stroke: new _xyz.mapview.lib.style.Stroke({
  //         color: 'rgba(255, 255, 255, 0.2)',
  //         width: 6
  //       }),
  //     }),
  //     new _xyz.mapview.lib.style.Style({
  //       stroke: new _xyz.mapview.lib.style.Stroke({
  //         color: 'rgba(255, 255, 255, 0.2)',
  //         width: 4
  //       }),
  //     }),
  //     new _xyz.mapview.lib.style.Style({
  //       stroke: location.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
  //         color: location.style.strokeColor,
  //         width: location.style.strokeWidth || 1
  //       }),
  //       fill: location.style.fillColor && new _xyz.mapview.lib.style.Fill({
  //         color: _xyz.utils.Chroma(location.style.fillColor).alpha(location.style.fillOpacity === 0 ? 0 : parseFloat(location.style.fillOpacity) || 1).rgba()
  //       }),
  //       // The default callback does not assign an image style for selected point locations.
  //     })
  //   ],
  //   dataProjection: location.layer.srid,
  //   featureProjection: _xyz.mapview.srid
  // });

  // Draw location marker.
  location.Marker = _xyz.mapview.geoJSON({
    geometry: {
      type: 'Point',
      coordinates: location.marker,
    },
    style: new _xyz.mapview.lib.style.Style({
      image: _xyz.mapview.icon({
        type: 'markerLetter',
        letter: String.fromCharCode(64 + _xyz.locations.list.length - _xyz.locations.list.indexOf(location.record)),
        color: location.style.strokeColor,
        scale: 0.05,
        anchor: [0.5, 1],
      })
    })
  });

  if (location._flyTo) location.flyTo();
    
  // Create an alert with the locations infoj if mapview popup is not defined.
  if (!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));

  // Add location to list view if initialised.
  if (_xyz.locations.listview.node) return _xyz.locations.listview.add(location);
    
  // Create mapview popup with the locations view node.
  _xyz.mapview.popup.create({
    coords: location.marker,
    content: location.view.drawer
  });

};