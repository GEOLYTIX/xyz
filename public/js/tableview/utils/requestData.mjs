import _xyz from '../../_xyz.mjs';

export default (layer, callback) => {
    
  let xhr = new XMLHttpRequest(), columns = [];

  Object.values(layer.infoj).map(entry => {
    if(!entry.type || entry.type === 'numeric' || entry.type === 'integer' || entry.type === 'textarea'){
      entry.title = entry.label;
      columns.push(entry);
    }
            
    if(entry.type === 'date') {
      entry.title = entry.label;
      entry.formatter = _xyz.utils.formatDate;
      columns.push(entry);
    }
            
    if(entry.type === 'datetime') {
      entry.title = entry.label;
      entry.formatter = _xyz.utils.formatDateTime;
      columns.push(entry);
    }
  });
    
  xhr.open('POST', _xyz.host + '/api/tab/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = e => {
    if (e.target.status !== 200) return;
    let data = JSON.parse(e.target.response);
    callback(layer, data, columns);
  };

  let params = {
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    offset: (layer.tableview.offset ? layer.tableview.offset : 0), // this will be click counter from load more button
    token: _xyz.token
  };
      
  if(layer.tableview.viewport) {
    const bounds = _xyz.map.getBounds(); // Get bounds for request.
    
    Object.assign(params, {
      viewport: layer.tableview.viewport,
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth()
    });
  }
  xhr.send(JSON.stringify(params));
};