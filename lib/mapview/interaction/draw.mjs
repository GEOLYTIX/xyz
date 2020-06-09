export default _xyz => {

  const draw = {

    begin: begin,

    finish: finish,

    cancel: cancel,

    update: update,

    feature: feature,

    format: new _xyz.mapview.lib.format.GeoJSON(),
 
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

    delete draw.kinks;

    draw.finish = params.finish || finish;

    draw.callback = params.callback;

    draw.layer = params.layer;

    if (!draw.layer.display) draw.layer.show();

    _xyz.mapview.node.style.cursor = 'crosshair';
   
    draw.vertices = [];
  
    _xyz.map.addLayer(draw.Layer);
  
    draw.interaction = new _xyz.mapview.lib.interaction.Draw({
      source: draw.Layer.getSource(),
      geometryFunction: params.geometryFunction || geometryFunction,
      freehand: params.freehand,
      type: params.type,
      condition: e => {

        if (draw.kinks) return false;

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

  function geometryFunction(coordinates, geometry) {

    if (!geometry) return new _xyz.mapview.lib.geom[draw.interaction.type_](coordinates);

    const kinks = _xyz.utils.turf.kinks({
      "type": draw.interaction.type_,
      "coordinates": geometry.getCoordinates()
    }).features;

    if (draw.interaction.type_ === 'Polygon' && coordinates[0].length) {   

      // Add a closing coordinate for polygon geometry.
      geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
    }

    draw.kinks = kinks.length > 0 && kinks[0].geometry.coordinates.join() !== coordinates[0][0].join()

    _xyz.mapview.node.style.cursor = draw.kinks ? 'not-allowed' : 'crosshair';

    return geometry;
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

  function feature(f) {

    const feature = draw.format.readFeature({
        type: 'Feature',
        geometry: f.geometry
    },{ 
        dataProjection: f.dataProjection || 'EPSG:4326',
        featureProjection: 'EPSG:' + _xyz.mapview.srid
    });

    draw.Layer.getSource().clear();

    draw.Layer.getSource().addFeature(feature);
  }

  function update() {

    const features = draw.Layer.getSource().getFeatures();
  
    const feature = JSON.parse(
      draw.format.writeFeature(
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
        table: draw.layer.table
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
      }}>Remove last vertex</li>`);

    menu.appendChild(_xyz.utils.wire()`
      <li  class="off-white-hover" onclick=${finish}>Cancel</li>`);

    _xyz.mapview.popup.create({
      coords: draw.vertices[draw.vertices.length - 1],
      content: menu
    });
  }
  
};