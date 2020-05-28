export default _xyz => entry => new Promise((resolve, reject) => {

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString(
      Object.assign({
      locale: _xyz.workspace.locale.key,
      layer: entry.location.layer && entry.location.layer.key,
      //dbs: dataview.dbs,
      id: entry.location.id,
      template: encodeURIComponent(entry.query)
    }, entry.queryparams || {})));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status >= 300) return reject({ err: e.target.status });

    resolve(e.target.response);

  }

  xhr.send();

})