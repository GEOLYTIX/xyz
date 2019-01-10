export default _xyz => {

  _xyz.locations.draw = record => {

    record.location.geometries = [];

    if (record.location.marker) {
      record.location.Marker = _xyz.L.geoJson(
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: record.location.marker
          }
        },
        {
          pointToLayer: function (feature, latlng) {
            return new L.Marker(latlng, {
              icon: _xyz.L.icon({
                iconUrl: _xyz.utils.svg_symbols({
                  type: 'markerLetter',
                  style: {
                    color: record.color,
                    letter: record.letter
                  }
                }),
                iconSize: 40,
                iconAnchor: [20, 40]
              }),
              interactive: false,
              pane: 'select_marker'
            });
          }
        }).addTo(_xyz.map);

      record.location.geometries.push(record.location.Marker);
    }

    record.location.Layer = _xyz.L.geoJson(
      {
        type: 'Feature',
        geometry: record.location.geometry
      },
      {
        interactive: false,
        pane: 'select',
        style: {
          stroke: true,
          color: record.color,
          fill: true,
          fillOpacity: 0
        },
        pointToLayer: function (feature, latlng) {
          return L.marker(
            latlng,
            {
              icon: _xyz.L.icon({
                iconSize: 35,
                iconUrl: _xyz.utils.svg_symbols({
                  type: 'circle',
                  style: {
                    color: record.color
                  }
                })
              }),
              pane: 'select_circle',
              interactive: _xyz.ws.select ? true : false,
              draggable: record.location.edit && record.location.edit.point
            });
        }
      }).addTo(_xyz.map);
       
    record.location.geometries.push(record.location.Layer);

  };

};