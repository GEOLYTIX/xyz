import view from './view/_view.mjs';

export default _xyz => () => {

  return {

    get: get,
  
    remove: remove,

    draw: draw,

    view: view,

    flyTo: flyTo,

    update: update,
  
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
            color: '#090'
          }
        }),
        size: 40
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

  function update(callback) {

    const location = this;

    const xhr = new XMLHttpRequest();

    xhr.open('POST', _xyz.host + '/api/location/update?token=' + _xyz.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = e => {

      if (e.target.status !== 200) return console.log(e.target.response);

      // Reset location infoj with response.
      location.infoj = JSON.parse(e.target.response);

      // Update the record.
      location.view.update();

      // Reload layer.
      _xyz.layers.list[location.layer].loaded = false;
      _xyz.layers.list[location.layer].get();

      if (callback) callback();

    };

    const infoj_newValues = location.infoj
      .filter(entry => (entry.newValue))
      .map(entry => {
        return {
          field: entry.field,
          newValue: entry.newValue,
          type: entry.type
        };
      });

    xhr.send(JSON.stringify({
      locale: _xyz.workspace.locale.key,
      layer: location.layer,
      table: location.table,
      id: location.id,
      infoj: infoj_newValues
    }));

  }

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

  function flyTo(){

    if (!_xyz.map) return;

    const location = this;

    if (location.geometry.type === 'Point') {

      _xyz.map.flyTo(
        {
          lat: location.geometry.coordinates[1],
          lng: location.geometry.coordinates[0],
        },
        _xyz.workspace.locale.maxZoom);

    } else {

      _xyz.map.flyToBounds(location.Layer.getBounds());

    }

  }

};