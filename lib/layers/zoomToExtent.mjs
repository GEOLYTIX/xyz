export default _xyz => function (params) {

  const layer = this;
  
  // Request to get the extent of layer data.
  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/query?' +
    _xyz.utils.paramString({
      template: 'layer_extent',
      locale: _xyz.workspace.locale.key,
      srid: _xyz.mapview.srid,
      layer: layer.key,
      filter: layer.filter && JSON.stringify(layer.filter.current),
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    const bounds = /\((.*?)\)/.exec(e.target.response.box2d)[1].replace(/ /g, ',');

    _xyz.mapview.flyToBounds(bounds.split(',').map(coords => parseFloat(coords)), params);
    
  };

  xhr.send();
  
};