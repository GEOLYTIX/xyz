export default (_xyz, layer) => filterZoom => {

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/layer/count?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));
      
  xhr.onload = e => {

    if (e.target.status !== 200) return;

    layer.filter.run_output.disabled = !(parseInt(e.target.response) > 1);

    if (filterZoom && parseInt(e.target.response) > 1) layer.zoomToExtent();

  };

  xhr.send();
    
};