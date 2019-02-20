import view from './view/_view.mjs';

export default _xyz => {

  return {

    view: view(_xyz),
  
    geometries: [],
  
    remove: remove,
  
    get: get,
  
  };

  function get(location, callback) {

    Object.assign(location, _xyz.locations.location);

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/select/id?' + _xyz.utils.paramString({
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

      location.infoj = e.target.response.infoj;

      location.geometry = e.target.response.geomj;

      location.view.update(location);

      if (callback) callback(location);

    };

    xhr.send();
 
  };


  function remove() {
 
    // Clear geometries and delete location to free up record.
    this.geometries.forEach(geom => _xyz.map.removeLayer(geom));

  };

};