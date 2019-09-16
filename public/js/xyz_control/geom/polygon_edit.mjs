export default _xyz => (e, layer) => {

  if(!layer.edit || !layer.edit.polygon) return;

  if(_xyz.mapview.state !== 'select') return;

  _xyz.geom.contextmenu.close();

  _xyz.geom.contextmenu.create(e, {
    items: [{
      label: 'Edit me',
      onclick: editHandler
    },
    {
      label: 'Area',
      onclick: area
    },
    {
      label: 'Perimeter',
      onclick: perimeter
    }]
  });

  _xyz.map.once('click', e => _xyz.geom.contextmenu.close());

  function editHandler(){

    requestGeoJSON(makeEdits);
        
    function makeEdits(_e){

        	_xyz.mapview.state = 'edit';

        	layer.edit.trail = _xyz.mapview.lib.featureGroup()
        	.on('click', e => _xyz.geom.contextmenu.close())
        	.addTo(_xyz.map);

        	redrawTrail(_e.target.response.geomj);

        	_xyz.map.once('contextmenu', ev => {

        		_xyz.geom.contextmenu.close();

        		_xyz.geom.contextmenu.create(ev, {
        			items: [{
        				label: 'Save me',
        				onclick: _ev => {

        					_ev.stopPropagation();

        					layer.edit.trail.eachLayer(l => l.editing.disable());

        				    let xhr = new XMLHttpRequest();

        					xhr.open('POST', _xyz.host + '/api/location/edit/geom/update?' + _xyz.utils.paramString({
        						locale: _xyz.workspace.locale.key,
        						layer: layer.key,
        						table: layer.table,
        						id: e.layer.properties.id,
        						token: _xyz.token
        					}));

        					xhr.setRequestHeader('Content-Type', 'application/json');

        					xhr.onload = res => {
        						layer.edit.trail.clearLayers();
        						layer.show();
        					};

        					xhr.send(JSON.stringify(layer.edit.trail.toGeoJSON().features[0].geometry));

        					_xyz.geom.contextmenu.close();
        				}
        			},
        			{
        				label: 'Cancel me',
        				onclick: _ev => {

        					_ev.stopPropagation();
        					layer.show();
        					_xyz.geom.contextmenu.close();
        					layer.edit.trail.eachLayer(l => l.editing.disable());
        					layer.edit.trail.clearLayers();
        				}
        			}]
        		});

        	});

    }
  }

  function redrawTrail(geojson){
        
    	let _points = _xyz.utils.turf.explode(geojson).features, points = [];

    	_points.map(feature => {
    		points.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
    });
    	
    	layer.edit.trail.clearLayers();

    	let poly = {
    		poly: {
    			allowIntersection: (layer.edit.polygon && typeof(layer.edit.polygon.allowIntersection) !== undefined ) ? layer.edit.polygon.allowIntersection : true
    		}
    	},
    	style = Object.assign({}, poly, _xyz.style.defaults.trail);

    if(geojson.type === 'Polygon'){
      layer.edit.trail.addLayer(_xyz.mapview.lib.polygon([points], style));
    } 

    if(geojson.type === 'LineString'){
      layer.edit.trail.addLayer(_xyz.mapview.lib.polyline([points], style));
    }

    	layer.edit.trail.eachLayer(l => {

    		l.editing.enable();

    		_xyz.map.on('draw:editvertex ', e => e.poly.intersects() ? e.poly.setStyle({color: '#DE3C4B'}) : e.poly.setStyle(style));

    	});
  }

  function area(){

    requestGeoJSON(getArea);

    function getArea(_e){
      alert(`Feature area: \n ${parseInt(_xyz.utils.turf.area(_e.target.response.geomj))} sqm \n ${(_xyz.utils.turf.area(_e.target.response.geomj)/(100*100)).toFixed(2)} sqkm`);

      console.log('area:');
      console.log(`${parseInt(_xyz.utils.turf.area(_e.target.response.geomj))} sqm`);
      console.log(`${(_xyz.utils.turf.area(_e.target.response.geomj)/(100*100)).toFixed(2)} sqkm`);
    }
  }

  function perimeter(){

    requestGeoJSON(getPerimeter);

    function getPerimeter(_e){
      alert(`Feature perimeter: \n ${_xyz.utils.turf.length(_e.target.response.geomj).toFixed(2)} km \n ${parseInt(1000*_xyz.utils.turf.length(_e.target.response.geomj))} m`);

      console.log('perimeter:');
      console.log(`${_xyz.utils.turf.length(_e.target.response.geomj).toFixed(2)} km`);
      console.log(`${parseInt(1000*_xyz.utils.turf.length(_e.target.response.geomj))} m`);
    }
  }

  function requestGeoJSON(callback){
    let xhr = new XMLHttpRequest();

    xhr.open('GET', 
      _xyz.host + '/api/location/select/id?' + // this returns infoj which is not needed
            _xyz.utils.paramString({
              locale: _xyz.workspace.locale.key,
              layer: layer.key,
              table: layer.table,
              id: e.layer.properties.id,
              token: _xyz.token
            }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = _e => {
      if (_e.target.status !== 200) return;
      callback(_e);
    };

    xhr.send();
  }

};