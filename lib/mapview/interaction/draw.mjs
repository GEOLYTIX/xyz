export default _xyz => {

  const draw = {

    begin: begin,

    finish: finish,

    cancel: cancel,

    update: update,
 
    Layer: new _xyz.mapview.lib.layer.Vector({
      source: new _xyz.mapview.lib.source.Vector()
    })

  };

  return draw;

  function begin(params) {
    
    _xyz.mapview.interaction.current
      && _xyz.mapview.interaction.current.finish
      && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = draw;

    draw.finish = params.finish || finish;

    draw.callback = params.callback;

    draw.layer = params.layer;

    if (!draw.layer.display) draw.layer.show();

    _xyz.mapview.node.style.cursor = 'crosshair';
   
    draw.vertices = [];
  
    _xyz.map.addLayer(draw.Layer);
  
    draw.interaction = new _xyz.mapview.lib.interaction.Draw({
      source: draw.Layer.getSource(),
      geometryFunction: params.geometryFunction,
      freehand: params.freehand,
      type: params.type,
      condition: e => {

        if(params.type === 'Polygon' || params.type === 'LineString'){

          if(draw.trail && _xyz.utils.turf.kinks(draw.trail).features.length > 0) return false;

          _xyz.map.on('pointermove', watchFeature);
          _xyz.map.un('click', unwatchFeature);

        }

        if (e.pointerEvent.buttons === 1) {
          draw.vertices.push(e.coordinate);
          if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove();
          return true;
        }
      }
    });
  
    draw.interaction.on('drawstart', e => {

      params.style && e.feature.setStyle(
        new _xyz.mapview.lib.style.Style({
        stroke: params.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
          color: _xyz.utils.Chroma(params.style.strokeColor),
          width: params.style.strokeWidth || 1
        })
      }));
      
      draw.Layer.getSource().clear();
      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
    });
  
    draw.interaction.on('drawend', e => {

      params.freehand && draw.vertices.push(e.target.sketchCoords_.pop());
      if (params.drawend) return params.drawend(e);
      setTimeout(contextmenu, 400);
    });
  
    _xyz.map.addInteraction(draw.interaction);

    _xyz.mapview.node.addEventListener('contextmenu', contextmenu);

  }

  function cancel() {
    finish();
    _xyz.mapview.interaction.highlight.begin();
  }
  
  function finish() {

    if (draw.callback) {
      draw.callback();
      delete draw.callback;
    }

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
  
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeInteraction(draw.interaction);

    _xyz.map.removeLayer(draw.Layer);

    draw.Layer.getSource().clear();
  }


  function update() {

    const features = draw.Layer.getSource().getFeatures();

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();
   
    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + draw.layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        })
    );
  
    const xhr = new XMLHttpRequest();
  
    xhr.open('POST', _xyz.host +
      '/api/location/new?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: draw.layer.key,
        table: draw.layer.table,
        token: _xyz.token
      }));
    
    xhr.setRequestHeader('Content-Type', 'application/json');
            
    xhr.onload = e => {
        
      if (e.target.status !== 200) return;
                      
      draw.layer.reload();
                      
      // Select polygon when post request returned 200.
      _xyz.locations.select({
        layer: draw.layer,
        table: draw.layer.table,
        id: e.target.response
      });
        
    };

    // Send path geometry to endpoint.
    xhr.send(JSON.stringify({
      geometry: feature.geometry
    }));
        
    cancel();
  
  }
 
  function contextmenu(e) {

    unwatchFeature(e);
  
    if (draw.vertices.length === 0) return;
  
    e && e.preventDefault();

    const menu = _xyz.utils.wire()`<ul>`;

    const features = draw.Layer.getSource().getFeatures();

    if (features.length) menu.appendChild(_xyz.utils.wire()`
      <li  class="off-white-hover" onclick=${update}>Save</li>`);

    if (!features.length) menu.appendChild(_xyz.utils.wire()`
      <li  class="off-white-hover" onclick=${e=>{
        e.preventDefault();
        draw.interaction.removeLastPoint();
        draw.vertices.pop();
        _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

        _xyz.map.on('pointermove', watchFeature);
      
      }}>Remove last vertex</li>`);

    menu.appendChild(_xyz.utils.wire()`
      <li  class="off-white-hover" onclick=${finish}>Cancel</li>`);

    _xyz.mapview.popup.create({
      coords: draw.vertices[draw.vertices.length - 1],
      content: menu
    });
  }

  function watchFeature(e){
    
    let mouse_coords = _xyz.mapview.lib.proj.transform(e.coordinate, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326');

    let coords = draw.vertices.map(c => {
      return _xyz.mapview.lib.proj.transform(c, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326');
    });

    coords.push(mouse_coords)
    coords.unshift(mouse_coords);

    draw.trail = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [coords]
      }
    };

    draw.info && draw.info.remove();
    draw.info = null;


    if(_xyz.utils.turf.kinks(_xyz.utils.turf.flatten(draw.trail).features[0]).features.length > 0) {

      e.stopPropagation();
      e.preventDefault();

      draw.info = _xyz.utils.wire()`<div class="infotip" style="color:#d32f2f;">Invalid geometry.`;
      _xyz.mapview.node.appendChild(draw.info);
      draw.info.style.left = `${e.originalEvent.clientX}px`;
      draw.info.style.top = `${e.originalEvent.clientY}px`;
      draw.info.style.opacity = 1;

      setTimeout(() => {
        draw.info && draw.info.remove();
        draw.info = null;
      }, 1.5*1000);

    }

  }

  function unwatchFeature(e){
    _xyz.map.un('pointermove', watchFeature);
    draw.trail = null;
  }
  
};