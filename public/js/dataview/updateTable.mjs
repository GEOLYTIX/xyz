export default _xyz => () => {

  const xhr = new XMLHttpRequest();

  const bounds = _xyz.mapview && _xyz.mapview.getBounds();
      
  xhr.open('GET', _xyz.host + '/api/layer/table?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    mapview_srid: _xyz.mapview.srid,
    layer: _xyz.dataview.current_layer.key,
    table: _xyz.dataview.current_layer.tableMax(),
    viewport: bounds ? true : false,
    west: bounds && bounds.west,
    south: bounds && bounds.south,
    east: bounds && bounds.east,
    north: bounds && bounds.north,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  
  xhr.onload = e => {
  
    if (e.target.status !== 200) return;
    
    _xyz.dataview.current_layer.dataview.table.setData(e.target.response);

    _xyz.dataview.current_layer.dataview.table.redraw(true);

  };

  xhr.send();

};