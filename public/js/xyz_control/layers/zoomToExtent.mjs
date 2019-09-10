export default _xyz => function () {

  const layer = this;
  
  // Request to get the extent of layer data.
  const xhr = new XMLHttpRequest();

  // Create filter from legend and current filter.
  const filter = Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    var extent = e.target.response.split(',');

    _xyz.map.getView().fit(extent, { duration: 1000 });
    
  };

  xhr.send();
  
};