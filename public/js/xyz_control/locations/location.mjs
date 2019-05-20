export default _xyz => () => {

  return {

    remove: remove,

    draw: draw,

    get: get,

    flyTo: flyTo,

    update: update,
  
    geometries: [],

    tables: [],

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

  function update(callback) {

    const location = this;

    const xhr = new XMLHttpRequest();

    xhr.open(
      'POST', 
      _xyz.host + 
      '/api/location/update?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: location.layer,
        table: location.table,
        id: location.id,
        token: _xyz.token
      }));

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
      infoj: infoj_newValues
    }));

  }

  function remove() {

    const location = this;
 
    // Clear geometries and delete location to free up record.
    location.geometries.forEach(
      geom => _xyz.map.removeLayer(geom)
    );

    if (location.Layer) _xyz.map.removeLayer(location.Layer);

    if (location.Marker) _xyz.map.removeLayer(location.Marker);

    location.tables.forEach(
      table => _xyz.tableview.removeTab(table)
    );
    
  };

  function draw(style) {

    if (!_xyz.map) return;

    const location = this;

    location.Layer = _xyz.geom.geoJSON({
      json: {
        type: 'Feature',
        geometry: location.geometry,
      },
      pane: (style && style.pane) || 'select',
      style: style || location.style,
    });

  };

  function flyTo(){

    if (!_xyz.map) return;

    const location = this;

    const allLayer = [location.Layer];

    location.geometries.forEach(layer => allLayer.push(layer));

    if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) allLayer.push(_xyz.mapview.locate.L);

    _xyz.map.flyToBounds(_xyz.L.featureGroup(allLayer).getBounds(),{
      padding: [25, 25]
    });

  }

  function get(callback){

    const location = this;

    if(!callback) return;
    
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
    
      if (e.target.status !== 200) return;

      // Push the hook for the location.
      if (_xyz.hooks) _xyz.hooks.push(
        'locations',
        `${location.layer}!${location.table}!${location.id}`
      );
  
      location.infoj = e.target.response.infoj;
    
      location.geometry = e.target.response.geomj;
  
      callback(location);
        
    };
    
    xhr.send();

  }

};