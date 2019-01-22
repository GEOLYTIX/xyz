export default _xyz => {

  _xyz.locations.draw = record => {

    record.location.geometries = [];

    if (record.location.marker) {

      record.location.Marker = _xyz.layers.geoJSON({
        json: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: record.location.marker
          }
        },
        pane: 'select_marker',
        icon: {
          url: _xyz.utils.svg_symbols({
            type: 'markerLetter',
            style: {
              color: record.color,
              letter: record.letter
            }
          })
        }
      });

      record.location.geometries.push(record.location.Marker);
    }

    record.location.Layer = _xyz.layers.geoJSON({
      json: {
        type: 'Feature',
        geometry: record.location.geometry
      },
      pane: 'select',
      style: {
        stroke: true,
        color: record.color,
        fill: true,
        fillOpacity: 0
      }
    });
         
    record.location.geometries.push(record.location.Layer);

  };

};