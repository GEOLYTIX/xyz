import _xyz from '../_xyz.mjs';

export default layer => {
  console.log('Hello I am sending layer content');

  //if(!layer.table) layer.table = getTable(layer); // zoom problem

  //console.log(layer);
  //console.log(layer.infoj);
  let xhr = new XMLHttpRequest();

  // Get bounds for request.
  const bounds = _xyz.map.getBounds();

  xhr.open('POST', _xyz.host + '/api/tab/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
    
  xhr.onload = e => {
    if (e.target.status !== 200) return;
    //let data = JSON.parse(e.target.response);
    //console.log(data);
    console.log(e.target.response);
  };
    
  xhr.send(JSON.stringify({
    locale: _xyz.locale,
    layer: layer.key,
    table: layer.table,
    count: 99,
    //filter: JSON.stringify(layer.filter),
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
    token: _xyz.token
  })); 
};


function getTable(layer){ // get table from tables based on zoom
  let zoom = _xyz.map.getZoom(),
    zoomKeys = Object.keys(layer.tables),
    maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]),
    minZoomKey = parseInt(zoomKeys[0]);

  if(zoom > maxZoomKey) { layer.table = layer.tables[maxZoomKey]; }
  else if(zoom < minZoomKey) { layer.table = layer.tables[minZoomKey]; }
  else {layer.table = layer.tables[zoom];  }

}