export default _xyz => {

  return layer => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.map.getBounds();
      
    xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
      locale: _xyz.locale,
      layer: layer.key,
      table: layer.table,
      //viewport: layer.tableview.viewport,
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth(),
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      if (e.target.status !== 200) return;
    
      layer.data = e.target.response;

      console.log(layer.data);

      layer.tableView.table.setData(layer.data);

    };

    xhr.send();

  };
  
};