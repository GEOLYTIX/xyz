export default _xyz => {

  return {

    begin: begin,

    //finish: finish,

    update: update,

  };

  function begin(params) {

    // *** DBZ: Can an interaction be current without a finish method?
    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = _xyz.mapview.interaction.draw;

    _xyz.mapview.interaction.draw.finish = params.finish || finish;

    _xyz.mapview.interaction.draw.callback = params.callback;

    _xyz.mapview.interaction.draw.layer = params.layer;

    if (!_xyz.mapview.interaction.draw.layer.display) _xyz.mapview.interaction.draw.layer.show();

    _xyz.mapview.node.style.cursor = 'crosshair';
   
    _xyz.mapview.interaction.draw.vertices = [];
  
    _xyz.mapview.interaction.draw.Source = new _xyz.mapview.lib.source.Vector();
  
    _xyz.mapview.interaction.draw.Layer = new _xyz.mapview.lib.layer.Vector({
      source: _xyz.mapview.interaction.draw.Source
    });
  
    _xyz.map.addLayer(_xyz.mapview.interaction.draw.Layer);
  
    _xyz.mapview.interaction.draw.interaction = new _xyz.mapview.lib.interaction.Draw({
      source: _xyz.mapview.interaction.draw.Source,
      geometryFunction: params.geometryFunction,
      freehand: params.freehand,
      type: params.type,
      condition: e => {
        if (e.pointerEvent.buttons === 1) {
          _xyz.mapview.interaction.draw.vertices.push(e.coordinate);
          if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove();
          return true;
        }
      }
    });
  
    _xyz.mapview.interaction.draw.interaction.on('drawstart', e => {

      params.style && e.feature.setStyle(
        new _xyz.mapview.lib.style.Style({
        stroke: params.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
          color: _xyz.utils.Chroma(params.style.strokeColor),
          width: params.style.strokeWidth || 1
        })
      }));
      
      _xyz.mapview.interaction.draw.Source.clear();
      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
    });
  
    _xyz.mapview.interaction.draw.interaction.on('drawend', e => {
      params.freehand && _xyz.mapview.interaction.draw.vertices.push(e.target.sketchCoords_.pop());
      if (params.drawend) return params.drawend(e);
      setTimeout(contextmenu, 400);
    });
  
    _xyz.map.addInteraction(_xyz.mapview.interaction.draw.interaction);

    _xyz.mapview.node.addEventListener('contextmenu', contextmenu);

  }
  
  
  function finish() {

    delete _xyz.mapview.interaction.draw.finish;

    _xyz.mapview.interaction.draw.Source.clear();

    _xyz.map.removeLayer(_xyz.mapview.interaction.draw.Layer);
  
    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
  
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeInteraction(_xyz.mapview.interaction.draw.interaction);
    
    _xyz.mapview.interaction.draw.callback && _xyz.mapview.interaction.draw.callback();

    _xyz.mapview.interaction.highlight.begin();
  }


  function update() {

    const features = _xyz.mapview.interaction.draw.Source.getFeatures();

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();
  
    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + _xyz.mapview.interaction.draw.layer.srid,
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
              layer: _xyz.mapview.interaction.draw.layer.key,
              table: _xyz.mapview.interaction.draw.layer.table,
              token: _xyz.token
            }));
    
    xhr.setRequestHeader('Content-Type', 'application/json');
            
    xhr.onload = e => {
        
      if (e.target.status !== 200) return;
                      
      _xyz.mapview.interaction.draw.layer.reload();
                      
      // Select polygon when post request returned 200.
      _xyz.locations.select({
        layer: _xyz.mapview.interaction.draw.layer,
        table: _xyz.mapview.interaction.draw.layer.table,
        id: e.target.response
      });
        
    };

    // Send path geometry to endpoint.
    xhr.send(JSON.stringify({
      geometry: feature.geometry
    }));
        
    finish();
  
  }

 
  function contextmenu(e) {
  
    if (_xyz.mapview.interaction.draw.vertices.length === 0) return;
  
    e && e.preventDefault();

    const menu = _xyz.utils.wire()`<ul class="context">`;

    const features = _xyz.mapview.interaction.draw.Source.getFeatures();

    if (features.length) menu.appendChild(_xyz.utils.wire()`<li onclick=${update}>Save</li>`);

    if (!features.length) menu.appendChild(_xyz.utils.wire()`<li onclick=${e=>{
      e.preventDefault();
      _xyz.mapview.interaction.draw.interaction.removeLastPoint();
      _xyz.mapview.interaction.draw.vertices.pop();
      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
    }}>Remove last vertice</li>`);

    menu.appendChild(_xyz.utils.wire()`<li onclick=${finish}>Cancel</li>`);

    _xyz.mapview.popup.create({
      coords: _xyz.mapview.interaction.draw.vertices[_xyz.mapview.interaction.draw.vertices.length - 1],
      content: menu
    });
  
  }
  
};