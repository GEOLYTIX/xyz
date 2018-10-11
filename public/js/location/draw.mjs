import _xyz from '../_xyz.mjs';

export default record => {

  if (record.location.geomdisplay) record.location.D = L.geoJson(
    {
      type: 'Feature',
      geometry: record.location.geomdisplay
    }, {
      interactive: false,
      pane: 'select_display',
      style: {
        stroke: false,
        color: record.color,
        weight: 2,
        fill: true,
        fillOpacity: 0.3
      }
    }).addTo(_xyz.map);

  if (record.location.marker) record.location.M = L.geoJson(
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: record.location.marker
      }
    }, {
      pointToLayer: function (feature, latlng) {
        return new L.Marker(latlng, {
          icon: L.icon({
            iconUrl: _xyz.utils.svg_symbols({
              type: 'markerLetter',
              style: {
                color: record.color,
                letter: record.letter
              }
            }),
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          }),
          interactive: false,
          pane: 'select_marker'
        });
      }
    }).addTo(_xyz.map);

  record.location.L = L.geoJson(
    {
      type: 'Feature',
      geometry: record.location.geometry
    }, {
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
            icon: L.icon({
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
            draggable: record.location.editable
          });
      }
    }).addTo(_xyz.map);
       
  // event for editable point features.
  record.location.L.getLayers()[0].on('dragend', function () {
    record.upload.style.display = 'block';
  });

};