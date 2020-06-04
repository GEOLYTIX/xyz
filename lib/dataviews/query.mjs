export default _xyz => dataview => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  const bounds = dataview.viewport && _xyz.mapview && _xyz.mapview.getBounds();

  const center = dataview.center && _xyz.mapview && _xyz.mapview.lib.proj.transform(
    _xyz.map.getView().getCenter(),
    'EPSG:' + _xyz.mapview.srid,
    'EPSG:4326');

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString(
      Object.assign({
      locale: _xyz.workspace.locale.key,
      layer: dataview.layer && dataview.layer.key,
      dbs: dataview.dbs,
      id: dataview.id,
      template: encodeURIComponent(dataview.query),
      lat: center && center[1],
      lng: center && center[0],
      filter: dataview.layer && dataview.layer.filter && JSON.stringify(dataview.layer.filter.current),
      viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _xyz.mapview.srid]
    }, dataview.queryparams || {})));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status });

    resolve(e.target.response);

  }

  xhr.send();

})