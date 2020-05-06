export default _xyz => function (callback) {

  const layer = this;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString({
      template: 'count_locations',
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.tableMin(),
      filter: layer.filter && JSON.stringify(layer.filter.current),
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
      
  xhr.onload = e => {

    if (e.target.status !== 200) return;

    callback && callback(parseInt(e.target.response.count));

  };

  xhr.send();

};