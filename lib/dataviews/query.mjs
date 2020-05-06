export default _xyz => params => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  const bounds = params.viewport && _xyz.mapview && _xyz.mapview.getBounds();

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: params.layer && params.layer.key,
      id: params.id,
      template: encodeURIComponent(params.query),
      filter: params.layer && params.layer.filter && JSON.stringify(params.layer.filter.current),
      viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _xyz.mapview.srid]
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status });

    resolve(e.target.response);

  }

  xhr.send();

})