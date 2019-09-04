export default _xyz => layer => {

  if (!layer.display) layer.show();

  layer.view.header.classList.add('edited');

  _xyz.mapview.node.style.cursor = 'crosshair';

  _xyz.map.un('click', _xyz.mapview.select);

  _xyz.mapview.node.removeEventListener('mousemove', _xyz.mapview.pointerMove);

  _xyz.mapview.lastCLick = null;

  const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

  const sourceVector = new _xyz.mapview.lib.source.Vector();

  const layerVector = new _xyz.mapview.lib.layer.Vector({
    source: sourceVector,
  });

  _xyz.map.addLayer(layerVector);

  const drawInteraction = new _xyz.mapview.lib.interaction.Draw({
    source: sourceVector,
    type: 'Point',
    condition: e => {
      if (e.pointerEvent.buttons === 1) {
        _xyz.mapview.lastCLick = e.coordinate;
        if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove();
        return true;
      }
    }
  });

  drawInteraction.on('drawstart', () => sourceVector.clear());

  drawInteraction.on('drawend', e => console.log(e));

  _xyz.map.addInteraction(drawInteraction);


  function update() {

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

    const features = sourceVector.getFeatures();

    sourceVector.clear();

    _xyz.map.removeLayer(layerVector);

    layer.view.header.classList.remove('edited');

    _xyz.mapview.node.style.cursor = 'auto';

    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeInteraction(drawInteraction);

    _xyz.map.on('click', _xyz.mapview.select);

    _xyz.mapview.node.addEventListener('mousemove', _xyz.mapview.pointerMove);

    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + layer.srid,
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
            layer: layer.key,
            table: layer.table,
            token: _xyz.token
          }));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
          
    xhr.onload = e => {
      
      if (e.target.status !== 200) return;
                    
      layer.reload();
                    
      // Select polygon when post request returned 200.
      _xyz.locations.select({
        layer: layer.key,
        table: layer.table,
        id: e.target.response,
      });
      
    };
            
    // Send path geometry to endpoint.
    xhr.send(JSON.stringify({
      geometry: feature.geometry
    }));
      
    //_xyz.mapview.state.finish();

  }


  function remove() {

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

    sourceVector.clear();

    _xyz.map.removeLayer(layerVector);

    layer.view.header.classList.remove('edited');

    _xyz.mapview.node.style.cursor = 'auto';

    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeInteraction(drawInteraction);

    _xyz.map.on('click', _xyz.mapview.select);

    _xyz.mapview.node.addEventListener('mousemove', _xyz.mapview.pointerMove);

  }


  function contextmenu(e) {

    if (!_xyz.mapview.lastCLick) return;

    e.preventDefault();

    _xyz.mapview.popup.create({
      coords: _xyz.mapview.lastCLick,
      content: _xyz.utils.wire()`
        <ul class="context">
        <li onclick=${update}>Save</li>
        <li onclick=${remove}>Cancel</li>`
    });

  }

  // Use right click context menu to upload polygon.
  _xyz.mapview.node.addEventListener('contextmenu', contextmenu);
  
};