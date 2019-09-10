export default _xyz => {

  return {

    begin: begin,

    finish: finish,

    update: update,

  };

  function begin(params) {

    _xyz.mapview.draw.drawend = params.drawend;

    finish();

    params.begin && params.begin();

    _xyz.mapview.draw.callback = params.callback;

    _xyz.mapview.draw.layer = params.layer;

    if (!_xyz.mapview.draw.layer.display) _xyz.mapview.draw.layer.show();

    _xyz.mapview.node.style.cursor = 'crosshair';
  
    _xyz.map.un('click', _xyz.mapview.select);
  
    _xyz.mapview.node.removeEventListener('mousemove', _xyz.mapview.pointerMove);
  
    _xyz.mapview.draw.vertices = [];
  
    _xyz.mapview.draw.sourceVector = new _xyz.mapview.lib.source.Vector();
  
    _xyz.mapview.draw.layerVector = new _xyz.mapview.lib.layer.Vector({
      source: _xyz.mapview.draw.sourceVector
    });
  
    _xyz.map.addLayer(_xyz.mapview.draw.layerVector);
  
    _xyz.mapview.draw.interaction = new _xyz.mapview.lib.interaction.Draw({
      source: _xyz.mapview.draw.sourceVector,
      geometryFunction: params.geometryFunction,
      type: params.type,
      condition: e => {
        if (e.pointerEvent.buttons === 1) {
          _xyz.mapview.draw.vertices.push(e.coordinate);
          if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove();
          return true;
        }
      }
    });
  
    _xyz.mapview.draw.interaction.on('drawstart', () => _xyz.mapview.draw.sourceVector.clear());
  
    _xyz.mapview.draw.drawend && _xyz.mapview.draw.interaction.on('drawend', _xyz.mapview.draw.drawend);
  
    _xyz.map.addInteraction(_xyz.mapview.draw.interaction);

    // Use right click context menu to upload polygon.
    _xyz.mapview.node.addEventListener('contextmenu', contextmenu);

  }
  
  function update() {

    const features = _xyz.mapview.draw.sourceVector.getFeatures();

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();
  
    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + _xyz.mapview.draw.layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        })
    );
  
    const xhr = new XMLHttpRequest();
  
    xhr.open(
      'POST', 
      _xyz.host + 
            '/api/location/edit/draw?' +
            _xyz.utils.paramString({
              locale: _xyz.workspace.locale.key,
              layer: _xyz.mapview.draw.layer.key,
              table: _xyz.mapview.draw.layer.table,
              token: _xyz.token
            }));
    
    xhr.setRequestHeader('Content-Type', 'application/json');
            
    xhr.onload = e => {
        
      if (e.target.status !== 200) return;
                      
      _xyz.mapview.draw.layer.reload();
                      
      // Select polygon when post request returned 200.
      _xyz.locations.select({
        layer: _xyz.mapview.draw.layer.key,
        table: _xyz.mapview.draw.layer.table,
        id: e.target.response,
      });
        
    };
              
    // Send path geometry to endpoint.
    xhr.send(JSON.stringify({
      geometry: feature.geometry
    }));
        
    finish();
  
  }
  
  function finish() {
  
    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
  
    _xyz.mapview.draw.sourceVector && _xyz.mapview.draw.sourceVector.clear();
  
    _xyz.mapview.draw.layerVector && _xyz.map.removeLayer(_xyz.mapview.draw.layerVector);
    
    _xyz.mapview.node.style.cursor = 'auto';
  
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);
  
    _xyz.mapview.draw.interaction && _xyz.map.removeInteraction(_xyz.mapview.draw.interaction);
  
    _xyz.map.on('click', _xyz.mapview.select);
  
    _xyz.mapview.node.addEventListener('mousemove', _xyz.mapview.pointerMove);

    _xyz.mapview.draw.callback && _xyz.mapview.draw.callback();

  }

 
  function contextmenu(e) {
  
    if (_xyz.mapview.draw.vertices.length === 0) return;
  
    e.preventDefault();

    const menu = _xyz.utils.wire()`<ul class="context">`;

    const features = _xyz.mapview.draw.sourceVector.getFeatures();

    if (features.length) menu.appendChild(_xyz.utils.wire()`<li onclick=${update}>Save</li>`);

    if (!features.length) menu.appendChild(_xyz.utils.wire()`<li onclick=${e=>{
      _xyz.mapview.draw.interaction.removeLastPoint();
      _xyz.mapview.draw.vertices.pop();
      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
    }}>Remove last vertice</li>`);

    menu.appendChild(_xyz.utils.wire()`<li onclick=${finish}>Cancel</li>`);

    _xyz.mapview.popup.create({
      coords: _xyz.mapview.draw.vertices[_xyz.mapview.draw.vertices.length - 1],
      content: menu
    });
  
  }
  
};