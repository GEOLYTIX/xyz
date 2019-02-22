import view from './view/_view.mjs';

export default _xyz => () => {

  return {

    get: get,
  
    remove: remove,

    draw: draw,

    drawMarker: drawMarker,

    view: view,
  
    geometries: [],

    style: {
      color: '#090',
      stroke: true,
      fill: true,
      fillOpacity: 0,
      icon: {
        url: _xyz.utils.svg_symbols({
          type: 'circle',
          style: {
            letter: 'X',
            colorMarker: '#090',
            colorDot: '#cf9',
            color: '#090'
          }
        }),
        size: 40,
        //anchor: [20, 40]
      }
    }
  
  };

  function get(callback) {

    const location = this;

    const xhr = new XMLHttpRequest();

    xhr.open(
      'GET',
      _xyz.host +
      '/api/location/select/id?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: location.layer,
        table: location.table,
        id: location.id,
        token: _xyz.token
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200) {
        if (callback) callback(location);
        return;
      }

      location.infoj = e.target.response.infoj;

      location.geometry = e.target.response.geomj;

      location.marker = location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;

      location.view = location.view(_xyz);

      location.view.update();

      if (callback) callback(location);

    };

    xhr.send();
 
  };

  function remove() {

    const location = this;
 
    // Clear geometries and delete location to free up record.
    location.geometries.forEach(geom => _xyz.map.removeLayer(geom));

    if (location.Layer) _xyz.map.removeLayer(location.Layer);

    if (location.Marker) _xyz.map.removeLayer(location.Marker);

  };

  function draw(style) {

    if (!_xyz.map) return;

    const location = this;

    location.Layer = _xyz.mapview.draw.geoJSON({
      json: {
        type: 'Feature',
        geometry: location.geometry,
      },
      pane: 'select',
      style: style || location.style,
    });
           
  };

  function drawMarker(style) {

    if (!_xyz.map) return;

    const location = this;

    location.Marker = _xyz.mapview.draw.geoJSON({
      json: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
        }
      },
      pane: 'select_marker',
      style: style || location.style
    });

  }

};