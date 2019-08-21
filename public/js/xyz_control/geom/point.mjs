export default _xyz => layer => {
    
  if (!layer.display) layer.show();
    
  layer.view.header.classList.add('edited');

  _xyz.mapview.node.style.cursor = 'crosshair';
    
  _xyz.map.un('click', _xyz.mapview.select);

  _xyz.mapview.node.removeEventListener('mousemove', _xyz.mapview.pointerMove);


  const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

  const sourceVector = new _xyz.mapview.lib.source.Vector();

  const layerVector = new _xyz.mapview.lib.layer.Vector({
    source: sourceVector,
    // style: new ol.style.Style({
    //   stroke: new ol.style.Stroke({
    //     color: '#EE266D',
    //     width: 2
    //   }),
    //   fill: new ol.style.Fill({
    //     color: 'rgba(0, 0, 0, 0.01)'
    //   }),
    //   image: new ol.style.Circle({
    //     radius: 7,
    //     fill: new ol.style.Fill({
    //       color: 'rgba(0, 0, 0, 0.01)'
    //     }),
    //     stroke: new ol.style.Stroke({
    //       color: '#EE266D',
    //       width: 2
    //     })
    //   })
    // })
  });

  _xyz.map.addLayer(layerVector);

  const drawInteraction = new _xyz.mapview.lib.interaction.Draw({
    source: sourceVector,
    type: 'Point'
  });

  drawInteraction.on('drawstart', () => sourceVector.clear());

  drawInteraction.on('drawend', e => console.log(e));

  _xyz.map.addInteraction(drawInteraction);


  function update() {

    const features = sourceVector.getFeatures();

    sourceVector.clear();

    _xyz.map.removeLayer(layerVector);

    layer.view.header.classList.remove('edited');

    _xyz.mapview.node.style.cursor = 'auto';

    _xyz.map.un('contextmenu', update); 

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


  // Use right click context menu to upload polygon.
  _xyz.map.on('contextmenu', update); 

  
};