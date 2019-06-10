export default _xyz => function(record){

  const gazetteer = this;

  if (gazetteer.result) gazetteer.result.innerHTML = '';
  if (gazetteer.input) gazetteer.input.value = record.label;
  
  if (record.source === 'glx') {

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: record.layer,
      table: record.table,
      id: record.id,
      marker: record.marker.split(','),
      _flyTo: true
    });

    return;
  }
  
  if (record.source === 'mapbox') {
    gazetteer.createFeature({
      type: 'Point',
      coordinates: record.marker
    });
    return;
  }
  
  if (record.source === 'google') {
  
    // Get the geometry from the gazetteer database.
    const xhr = new XMLHttpRequest();
  
    xhr.open('GET', _xyz.host + '/api/gazetteer/googleplaces?id=' + record.id + '&token=' + _xyz.token);

    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      // Send results to createFeature
      if (e.target.status === 200) gazetteer.createFeature(e.target.response);
  
    };

    xhr.send();
  }

};