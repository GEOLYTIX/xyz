export default _xyz => location => {

  location.geometries = [];

  location.Marker = _xyz.locations.drawGeoJSON({
    json: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
      }
    },
    pane: 'select_marker',
    icon: {
      url: _xyz.utils.svg_symbols({
        type: 'markerLetter',
        style: location.style,
      })
    }
  });

  location.geometries.push(location.Marker);

  location.Layer = _xyz.locations.drawGeoJSON({
    json: {
      type: 'Feature',
      geometry: location.geometry,
    },
    pane: 'select',
    style: location.style,
  });
         
  location.geometries.push(location.Layer);

};