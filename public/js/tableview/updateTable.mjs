export default _xyz => {

  _xyz.tableview.updateTable = () => {

    const xhr = new XMLHttpRequest();

    const bounds = _xyz.map && _xyz.map.getBounds();
      
    xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: _xyz.tableview.current_layer.key,
      table: _xyz.tableview.current_layer.tableMax(),
      viewport: bounds ? true : false,
      west: bounds && bounds.getWest(),
      south: bounds && bounds.getSouth(),
      east: bounds && bounds.getEast(),
      north: bounds && bounds.getNorth(),
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
  
    xhr.onload = e => {
  
      if (e.target.status !== 200) return;
    
      _xyz.tableview.current_layer.table_view.table.setData(e.target.response);

      _xyz.tableview.current_layer.table_view.table.redraw(true);

    };

    xhr.send();

  };
  
};