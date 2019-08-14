export default _xyz => location => {

  // Create location view.
  location.view();

  // Draw location to map.
  location.draw();

  location.Marker = _xyz.mapview.geoJSON({
    json: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: location.marker,
      }
    },
    style: new _xyz.mapview.lib.style.Style({
      image: _xyz.mapview.icon({
        url: _xyz.utils.svg_symbols({
          type: 'markerLetter',
          style: {
            letter: 'X',
            color: '#090'
          }
        }),
        iconSize: 40,
        anchor: [0.5, 1],
      })
    }),
    // style: new _xyz.mapview.lib.style.Style({
    //   image: new _xyz.mapview.lib.style.Circle({
    //     radius: 20,
    //     fill: new _xyz.mapview.lib.style.Fill({
    //       color: 'rgba(0, 0, 0, 0.01)'
    //     }),
    //     stroke: new _xyz.mapview.lib.style.Stroke({
    //       color: '#EE266D',
    //       width: 2
    //     })
    //   })
    // }),
    dataProjection: '3857',
    featureProjection: '3857'
  });
    
  // Create an alert with the locations infoj if mapview popup is not defined.
  if (!_xyz.mapview.popup) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
    
  if (_xyz.locations.listview.node) return _xyz.locations.listview.add(location);
    
  // Create mapview popup with the locations view node.
  _xyz.mapview.popup.create({
    coords: location.marker, //_xyz.mapview.lib.proj.transform(location.marker, 'EPSG:4326', 'EPSG:3857'),
    content: location.view.node
  });

};