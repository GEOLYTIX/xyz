export default _xyz => function(record, callback){

  const gazetteer = this;

  if (gazetteer.result) gazetteer.result.innerHTML = '';
  if (gazetteer.input) gazetteer.input.value = record.label;

  const sources = {
    glx: glx,
    mapbox: mapbox,
    google: google,
  };

  sources[record.source](record, callback);
  
  function glx(record, callback) {

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: record.layer,
      table: record.table,
      id: record.id,
      marker: record.marker.split(','),
      _flyTo: true
    });

    if (callback) callback();
  }
  
  function mapbox(record, callback) {

    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    });

    if (callback) callback();
  }

  function google (record, callback) {

    // Get the geometry from the gazetteer database.
    const xhr = new XMLHttpRequest();
  
    xhr.open('GET', _xyz.host + '/api/gazetteer/googleplaces?id=' + record.id + '&token=' + _xyz.token);
    
    xhr.responseType = 'json';
      
    xhr.onload = e => {
      
      // Send results to createFeature
      if (e.target.status === 200) gazetteer.createFeature(e.target.response);
    
      if (callback) callback(e.target.response);
      
    };
    
    xhr.send();
  }

};