export default _xyz => {

  return {

    begin: begin,

    finish: finish,

    update: update,

    style: [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#3399CC',
          width: 1
        }),
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          stroke: new ol.style.Stroke({
            color: '#3399CC',
            width: 1
          })
        }),
        geometry: function(feature) {

          const geometry = feature.getGeometry();

          if (geometry.getType() === 'Point') return new ol.geom.Point(geometry.getCoordinates());

          if (geometry.getType() === 'LineString') return new ol.geom.MultiPoint(geometry.getCoordinates());

          // return the coordinates of the first ring of the polygon
          return new ol.geom.MultiPoint(geometry.getCoordinates()[0]);
        }
      })
    ]

  };


  function begin(params) {

    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = _xyz.mapview.interaction.edit;

    _xyz.mapview.interaction.edit.finish = params.finish || finish;

    _xyz.mapview.interaction.edit.update = params.update || update;

    _xyz.mapview.interaction.edit.callback = params.callback;

    _xyz.mapview.interaction.edit.location = params.location;

    _xyz.mapview.node.style.cursor = 'crosshair';

    _xyz.mapview.interaction.edit.vertices = [params.location.marker];

    _xyz.mapview.interaction.edit.feature = [];

    _xyz.mapview.interaction.edit.Source = params.source || new ol.source.Vector({
      features: [_xyz.mapview.interaction.edit.location.Layer.getSource().getFeatures()[0].clone()]
    });

    _xyz.mapview.interaction.edit.Layer = new ol.layer.Vector({
      source: _xyz.mapview.interaction.edit.Source,
      zIndex: 20,
      style: _xyz.mapview.interaction.edit.style,
    });

    _xyz.map.addLayer(_xyz.mapview.interaction.edit.Layer);

    _xyz.mapview.interaction.edit.interaction = new ol.interaction.Modify({
      source: _xyz.mapview.interaction.edit.Source,
      condition: e => {

        if(params.type !== 'Polygon' && params.type === 'LineString') return true;

        return !(_xyz.mapview.interaction.edit.trail && (_xyz.utils.turf.kinks(_xyz.utils.turf.flatten(_xyz.mapview.interaction.edit.trail).features[0]).features.length > 0));
      
      }

    });
  
    _xyz.mapview.interaction.edit.interaction.on('modifystart', e => {

      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      _xyz.mapview.interaction.edit.feature.push(_xyz.mapview.interaction.edit.Source.getFeatures()[0].clone());
    });

    _xyz.mapview.interaction.edit.interaction.on('modifyend', e => {
      
      _xyz.mapview.interaction.edit.vertices.push(e.mapBrowserEvent.coordinate);

      if(params.type === 'Polygon' || params.type === 'LineString') validateFeature(e);

    });
  
    _xyz.map.addInteraction(_xyz.mapview.interaction.edit.interaction);

    _xyz.mapview.node.addEventListener('contextmenu', contextmenu);

  }


  function finish() {

    delete _xyz.mapview.interaction.edit.finish;

    _xyz.mapview.interaction.edit.Source && _xyz.mapview.interaction.edit.Source.clear();

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeLayer(_xyz.mapview.interaction.edit.Layer);
  
    _xyz.map.removeInteraction(_xyz.mapview.interaction.edit.interaction);
  
    _xyz.mapview.interaction.edit.callback && _xyz.mapview.interaction.edit.callback();

    _xyz.mapview.interaction.highlight.begin();

    _xyz.mapview.interaction.edit.info && _xyz.mapview.interaction.edit.info.remove();
    
    _xyz.mapview.interaction.edit.info = null;
    _xyz.mapview.interaction.edit.trail = null;
  
  }

  function update() {

    const features = _xyz.mapview.interaction.edit.Source.getFeatures();

    const location = _xyz.mapview.interaction.edit.location;

    const layer = location.layer;

    const geoJSON = new ol.format.GeoJSON();

    const feature = JSON.parse(
      geoJSON.writeFeature(
        features[0],
        { 
          dataProjection: 'EPSG:' + layer.srid,
          featureProjection: 'EPSG:' + _xyz.mapview.srid
        })
    );
  
    const xhr = new XMLHttpRequest();
  
    xhr.open('POST', _xyz.host +
      '/api/location/update?' +
      _xyz.utils.paramString({
        locale: _xyz.locale.key,
        layer: layer.key,
        table: location.table,
        id: location.id
      }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {

      if (e.target.status !== 200) return;

      const locationFeature = location.Layer.getSource().getFeatures()[0];

      locationFeature.setGeometry(features[0].getGeometry());

      _xyz.map.removeLayer(location.Marker); // remove Marker from map

      location.geometry = feature.geometry; // assign new geometry

      // make new marker
      location.marker = ol.proj.transform( 
        _xyz.utils.turf.pointOnFeature(feature.geometry).geometry.coordinates,  
        'EPSG:' + location.layer.srid,
        'EPSG:' + _xyz.mapview.srid);

      // draw updated Marker
      location.Marker = _xyz.mapview.geoJSON({ 
        geometry: {
          type: 'Point',
          coordinates: location.marker,
        },
        zIndex: 2000,
        style: new ol.style.Style({
          image: _xyz.mapview.icon({
            type: 'markerLetter',
            letter: String.fromCharCode(65 + _xyz.locations.list.indexOf(location.record)),
            color: location.style.strokeColor,
            scale: 2,
            anchor: [0.4, 0.9]
          })
        })
      });

      // reload layer
      layer.reload();

    };

    // Send path geometry to endpoint.
    xhr.send(JSON.stringify({[layer.geom]:feature.geometry}));

    finish();
  }

  function undo(e) {

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();

    _xyz.mapview.interaction.edit.Source.clear();

    _xyz.mapview.interaction.edit.Source.addFeature(_xyz.mapview.interaction.edit.feature.pop());

    _xyz.mapview.interaction.edit.vertices.pop();

    validateFeature(e);
  }

  function contextmenu(e) {
   
    e.preventDefault();

    const menu = _xyz.utils.html.node`<ul>`;

    !_xyz.mapview.interaction.edit.info
      && _xyz.mapview.interaction.edit.feature.length
      && menu.appendChild(_xyz.utils.html.node`
        <li style="padding: 5px;" class="off-white-hover" onclick=${_xyz.mapview.interaction.edit.update}>${_xyz.language.layer_draw_update}</li>`);

    _xyz.mapview.interaction.edit.feature.length
      && menu.appendChild(_xyz.utils.html.node`
        <li style="padding: 5px;" class="off-white-hover" onclick=${undo}>${_xyz.language.layer_draw_undo}</li>`);

    menu.appendChild(_xyz.utils.html.node`
      <li style="padding: 5px;" class="off-white-hover" onclick=${finish}>${_xyz.language.layer_draw_cancel}</li>`);

    _xyz.mapview.popup.create({
      coords: _xyz.mapview.interaction.edit.vertices[_xyz.mapview.interaction.edit.vertices.length - 1],
      content: menu,
      autoPan: true
    });
  }

  function validateFeature(e){

    const geoJSON = new ol.format.GeoJSON();

    _xyz.mapview.interaction.edit.trail = null;

    _xyz.mapview.interaction.edit.trail = geoJSON.writeFeatureObject(
      _xyz.mapview.interaction.edit.Source.getFeatures()[0].clone(), {
        dataProjection: 'EPSG:4326',
        featureProjection:'EPSG:' + _xyz.mapview.srid
      });

    if(_xyz.mapview.interaction.edit.trail.geometry.type === "Point") return;

    _xyz.mapview.interaction.edit.info && _xyz.mapview.interaction.edit.info.remove();
    _xyz.mapview.interaction.edit.info = null;

    if(_xyz.utils.turf.kinks(_xyz.mapview.interaction.edit.trail).features.length > 0){

      _xyz.mapview.interaction.edit.info = _xyz.utils.html.node`
        <div class="infotip" style="color:#d32f2f;">${_xyz.language.layer_draw_error}`;

      _xyz.mapview.node.appendChild(_xyz.mapview.interaction.edit.info);
      _xyz.mapview.interaction.edit.info.style.left = `${e.mapBrowserEvent.originalEvent.clientX}px`;
      _xyz.mapview.interaction.edit.info.style.top = `${e.mapBrowserEvent.originalEvent.clientY}px`;
      _xyz.mapview.interaction.edit.info.style.opacity = 1;
    }
    
  }

}