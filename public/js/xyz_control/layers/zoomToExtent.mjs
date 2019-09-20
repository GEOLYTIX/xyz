export default _xyz => function () {

  const layer = this;
  
  // Request to get the extent of layer data.
  const xhr = new XMLHttpRequest();

  // Create filter from legend and current filter.
  const filter = Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    mapview_srid: _xyz.mapview.srid,
    layer: layer.key,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    var extent = e.target.response.split(',');

    let _extent = extent.map(each => parseFloat(each));

    _xyz.map.getView().fit(_extent, { duration: 1000 });
    
  };

  xhr.send();
  
};