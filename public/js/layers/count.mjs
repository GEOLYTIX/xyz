export default _xyz => function (callback) {

  const layer = this;

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/layer/count?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.tableMin(),
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));
      
  xhr.onload = e => {

    if (e.target.status !== 200) return;

    callback && callback(parseInt(e.target.response));

  };

  xhr.send();

};