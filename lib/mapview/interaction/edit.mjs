export default _xyz => {

  const edit = {

    begin: begin,

    finish: finish,

    update: update,

    Style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        stroke: new ol.style.Stroke({
          color: '#ff69b4',
          width: 2
        })
      })
    }),

    style: [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#FFA500',
          width: 3
        }),
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          fill: new ol.style.Fill({
            color: '#FFA500',
          }),
          stroke: new ol.style.Stroke({
            color: '#FFA500',
            width: 2
          })
        }),
        geometry: _xyz.utils.verticeGeoms
      })
    ]

  }

  return edit


  function begin(params) {

    // Finish the current interaction.
    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish()

    // Make modify the current interaction.
    _xyz.mapview.interaction.current = edit

    edit.finish = params.finish || finish

    edit.update = params.update || update

    edit.callback = params.callback

    edit.location = params.location

    _xyz.mapview.node.style.cursor = 'crosshair'

    edit.vertices = [params.location.marker]

    edit.feature = []

    edit.Source = params.source || new ol.source.Vector({
      features: [edit.location.Layer.getSource().getFeatures()[0].clone()]
    })

    edit.Layer = new ol.layer.Vector({
      source: edit.Source,
      zIndex: 9999,
      style: edit.style,
    })

    _xyz.map.addLayer(edit.Layer)

    edit.interaction = new ol.interaction.Modify({
      source: edit.Source,
      style: edit.Style,
      condition: e => {

        if(params.type !== 'Polygon' && params.type === 'LineString') return true;

        return !(edit.trail && (_xyz.utils.turf.kinks(_xyz.utils.turf.flatten(edit.trail).features[0]).features.length > 0));
      
      }

    });
  
    edit.interaction.on('modifystart', e => {

      _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      edit.feature.push(edit.Source.getFeatures()[0].clone());
    });

    edit.interaction.on('modifyend', e => {
      
      edit.vertices.push(e.mapBrowserEvent.coordinate);

      if(params.type === 'Polygon' || params.type === 'LineString') validateFeature(e);

    });
  
    _xyz.map.addInteraction(edit.interaction)

    if (params.snapSource) {
      edit.snapInteraction = new ol.interaction.Snap({
        source: params.snapSource
      })

      _xyz.map.addInteraction(edit.snapInteraction)
    }

    _xyz.mapview.node.addEventListener('contextmenu', contextmenu)

  }


  function finish() {

    delete edit.finish;

    edit.Source && edit.Source.clear();

    _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove();
      
    _xyz.mapview.node.removeEventListener('contextmenu', contextmenu);

    _xyz.map.removeLayer(edit.Layer);
  
    _xyz.map.removeInteraction(edit.interaction)

    if (edit.snapInteraction) {
      _xyz.map.removeInteraction(edit.snapInteraction)
      delete edit.snapInteraction
    }
  
    edit.callback && edit.callback();

    _xyz.mapview.interaction.highlight.begin();

    edit.info && edit.info.remove();
    
    edit.info = null;
    edit.trail = null;
  
  }

  function update() {

    const features = edit.Source.getFeatures();

    const location = edit.location;

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

    edit.Source.clear();

    edit.Source.addFeature(edit.feature.pop());

    edit.vertices.pop();

    validateFeature(e);
  }

  function contextmenu(e) {
   
    e.preventDefault();

    const menu = _xyz.utils.html.node`<ul>`;

    !edit.info
      && edit.feature.length
      && menu.appendChild(_xyz.utils.html.node`
        <li style="padding: 5px;" class="off-white-hover" onclick=${edit.update}>${_xyz.language.layer_draw_update}</li>`);

    edit.feature.length
      && menu.appendChild(_xyz.utils.html.node`
        <li style="padding: 5px;" class="off-white-hover" onclick=${undo}>${_xyz.language.layer_draw_undo}</li>`);

    menu.appendChild(_xyz.utils.html.node`
      <li style="padding: 5px;" class="off-white-hover" onclick=${finish}>${_xyz.language.layer_draw_cancel}</li>`);

    _xyz.mapview.popup.create({
      coords: edit.vertices[edit.vertices.length - 1],
      content: menu,
      autoPan: true
    });
  }

  function validateFeature(e){

    const geoJSON = new ol.format.GeoJSON();

    edit.trail = null;

    edit.trail = geoJSON.writeFeatureObject(
      edit.Source.getFeatures()[0].clone(), {
        dataProjection: 'EPSG:4326',
        featureProjection:'EPSG:' + _xyz.mapview.srid
      });

    if(edit.trail.geometry.type === "Point") return;

    edit.info && edit.info.remove();
    edit.info = null;

    if(_xyz.utils.turf.kinks(edit.trail).features.length > 0){

      edit.info = _xyz.utils.html.node`
        <div class="infotip" style="color:#d32f2f;">${_xyz.language.layer_draw_error}`;

      _xyz.mapview.node.appendChild(edit.info);
      edit.info.style.left = `${e.mapBrowserEvent.originalEvent.clientX}px`;
      edit.info.style.top = `${e.mapBrowserEvent.originalEvent.clientY}px`;
      edit.info.style.opacity = 1;
    }
    
  }

}