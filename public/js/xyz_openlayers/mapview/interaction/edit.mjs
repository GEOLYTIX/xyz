export default _xyz => {

  return {

    begin: begin,

    //finish: finish,

    update: update,

    style: [
      new _xyz.mapview.lib.style.Style({
        stroke: new _xyz.mapview.lib.style.Stroke({
          color: '#3399CC',
          width: 1
        }),
      }),
      new _xyz.mapview.lib.style.Style({
        image: new _xyz.mapview.lib.style.Circle({
          radius: 6,
          stroke: new _xyz.mapview.lib.style.Stroke({
            color: '#3399CC',
            width: 1
          })
        }),
        geometry: function(feature) {

          const geometry = feature.getGeometry();

          if (geometry.getType() === 'Point') return new _xyz.mapview.lib.geom.Point(geometry.getCoordinates());

          if (geometry.getType() === 'LineString') return new _xyz.mapview.lib.geom.MultiPoint(geometry.getCoordinates());

          // return the coordinates of the first ring of the polygon
          return new _xyz.mapview.lib.geom.MultiPoint(geometry.getCoordinates()[0]);
        }
      })
    ]

  };


  function begin(params) {

    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = _xyz.mapview.interaction.edit;

    _xyz.mapview.interaction.edit.finish = params.finish || finish;

    _xyz.mapview.interaction.edit.callback = params.callback;

    _xyz.mapview.interaction.edit.location = params.location;

    _xyz.mapview.node.style.cursor = 'crosshair';

    _xyz.mapview.interaction.edit.vertices = [params.location.marker];

    _xyz.mapview.interaction.edit.feature = [];
  
    _xyz.mapview.interaction.edit.Source = new _xyz.mapview.lib.source.Vector({
      features: [_xyz.mapview.interaction.edit.location.Layer.getSource().getFeatures()[0].clone()]
    });
   
    _xyz.mapview.interaction.edit.Layer = new _xyz.mapview.lib.layer.Vector({
      source: _xyz.mapview.interaction.edit.Source,
      zIndex: 20,
      style: _xyz.mapview.interaction.edit.style,
    });

    _xyz.map.addLayer(_xyz.mapview.interaction.edit.Layer);

    _xyz.mapview.interaction.edit.interaction = new _xyz.mapview.lib.interaction.Modify({
      source: _xyz.mapview.interaction.edit.Source
    });
  
    _xyz.mapview.interaction.edit.interaction.on('modifystart', e => {
      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      _xyz.mapview.interaction.edit.feature.push(_xyz.mapview.interaction.edit.Source.getFeatures()[0].clone());
    });

    _xyz.mapview.interaction.edit.interaction.on('modifyend', e => {
      _xyz.mapview.interaction.edit.vertices.push(e.mapBrowserEvent.coordinate);
    });
  
    _xyz.map.addInteraction(_xyz.mapview.interaction.edit.interaction);

    _xyz.mapview.node.addEventListener('contextmenu', contextmenu);

  }


  function finish() {

    delete _xyz.mapview.interaction.edit.finish;

    _xyz.mapview.interaction.edit.Source.clear();

    _xyz.map.removeLayer(_xyz.mapview.interaction.edit.Layer);
    
    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);
  
    _xyz.map.removeInteraction(_xyz.mapview.interaction.edit.interaction);
  
    _xyz.mapview.interaction.edit.callback && _xyz.mapview.interaction.edit.callback();

    _xyz.mapview.interaction.highlight.begin();
  }


  function update() {

    const features = _xyz.mapview.interaction.edit.Source.getFeatures();

    const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + _xyz.mapview.interaction.edit.location.layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        })
    );
  
    const xhr = new XMLHttpRequest();
  
    xhr.open(
      'POST',
      _xyz.host + '/api/location/edit/geom/update?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        layer: _xyz.mapview.interaction.edit.location.layer.key,
        table: _xyz.mapview.interaction.edit.location.table,
        id: _xyz.mapview.interaction.edit.location.id,
        token: _xyz.token
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      _xyz.mapview.interaction.edit.location.layer.reload();

      const locationFeature = _xyz.mapview.interaction.edit.location.Layer.getSource().getFeatures()[0];

      locationFeature.setGeometry(features[0].getGeometry());

    };

    // Send path geometry to endpoint.
    xhr.send(JSON.stringify(feature.geometry));

    finish();

  }


  function undo() {

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

    _xyz.mapview.interaction.edit.Source.clear();

    _xyz.mapview.interaction.edit.Source.addFeature(_xyz.mapview.interaction.edit.feature.pop());

    _xyz.mapview.interaction.edit.vertices.pop();
  }


  function contextmenu(e) {
   
    e.preventDefault();

    const menu = _xyz.utils.wire()`<ul class="context">`;

    _xyz.mapview.interaction.edit.feature.length && menu.appendChild(_xyz.utils.wire()`<li onclick=${update}>Update</li>`);

    _xyz.mapview.interaction.edit.feature.length && menu.appendChild(_xyz.utils.wire()`<li onclick=${undo}>Undo</li>`);

    menu.appendChild(_xyz.utils.wire()`<li onclick=${finish}>Cancel</li>`);

    _xyz.mapview.popup.create({
      coords: _xyz.mapview.interaction.edit.vertices[_xyz.mapview.interaction.edit.vertices.length - 1],
      content: menu
    });
  
  }

};