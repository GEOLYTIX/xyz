import explode from '@turf/explode';

import 'leaflet-draw';

export default _xyz => (e, layer) => {

	if(!layer.edit || !layer.edit.polygon) return;

	closeContextMenu();

	_xyz.mapview.contextmenu = _xyz.utils.createElement({
		tag: 'div',
		options: {
			classList: 'contextmenu'
		},
        style: {
          left: `${e.layerPoint.x}px`,
          top: `${e.layerPoint.y}px`
        },
        appendTo: _xyz.mapview.node
      });

    let ul = _xyz.utils.createElement({
        tag: 'ul',
        appendTo: _xyz.mapview.contextmenu
      });

    _xyz.utils.createElement({
        tag: 'li',
        options: {
          textContent: 'Edit me'
        },
        appendTo: ul,
        eventListener: {
        	event: 'click',
        	funct: () => {
        		const xhr = new XMLHttpRequest();

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

        			_xyz.mapview.state = 'edit';

        			layer.edit.trail = _xyz.L.featureGroup()
        			.on('click', e => closeContextMenu())
        			.addTo(_xyz.map);

        			redrawTrail(_e.target.response.geomj);

        			_xyz.map.once('contextmenu', ev => {

        				closeContextMenu();

        				_xyz.mapview.contextmenu = _xyz.utils.createElement({
        					tag: 'div',
        					options: {
        						classList: 'contextmenu'
        					},
        					style: {
        						left: `${ev.layerPoint.x}px`,
        						top: `${ev.layerPoint.y}px`
        					},
        					appendTo: _xyz.mapview.node
        				});

        				let ul = _xyz.utils.createElement({
        					tag: 'ul',
        					appendTo: _xyz.mapview.contextmenu
        				});

        				_xyz.utils.createElement({
        					tag: 'li',
        					options: {
        						textContent: 'Save me'
        					},
        					appendTo: ul,
        					eventListener: {
        						event: 'click',
        						funct: ev => {
        							ev.stopPropagation();

        							layer.edit.trail.eachLayer(l => l.editing.disable());

        							let xhr = new XMLHttpRequest();

        							xhr.open('POST', _xyz.host + '/api/location/edit/mvt?' + _xyz.utils.paramString({
        								locale: _xyz.workspace.locale.key,
        								layer: layer.key,
        								table: layer.table,
        								id: e.layer.properties.id,
        								token: _xyz.token
        							}));

        							xhr.setRequestHeader('Content-Type', 'application/json');

        							xhr.onload = e => {
        								console.log(e.target.response);
        								layer.edit.trail.clearLayers();
        								layer.show();
        							};

        							xhr.send(JSON.stringify(layer.edit.trail.toGeoJSON().features[0].geometry));

        							closeContextMenu();
        						}
        					}
        				});

        				_xyz.utils.createElement({
        					tag: 'li',
        					options: {
        						textContent: 'Cancel me'
        					},
        					appendTo: ul,
        					eventListener: {
        						event: 'click',
        						funct: ev => {
        							ev.stopPropagation();

        							layer.show();

        							closeContextMenu();
        							
        							layer.edit.trail.eachLayer(l => l.editing.disable());

        							layer.edit.trail.clearLayers();
        						}
        					}
        				});
        			});
        		}

        		xhr.send();
        	}
        }
    });

    _xyz.utils.createElement({
        tag: 'li',
        options: {
          textContent: 'Area'
        },
        appendTo: ul
      });

    _xyz.utils.createElement({
        tag: 'li',
        options: {
          textContent: 'Perimeter'
        },
        appendTo: ul
      });

    _xyz.map.once('click', e => closeContextMenu());

    function closeContextMenu(){ // close context menu if open
    	_xyz.mapview.node.style.cursor = '';
    	_xyz.mapview.state = 'select';
    	if(_xyz.mapview.contextmenu) {
    		_xyz.mapview.contextmenu.remove();
    		_xyz.mapview.contextmenu = null;
    	}
    }

    function redrawTrail(geojson){
    	let _points = explode(geojson).features, points = [];

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

    	layer.edit.trail.addLayer(_xyz.L.polygon([points], style));

    	layer.edit.trail.eachLayer(l => {

    		l.editing.enable();

    		_xyz.map.on('draw:editvertex ', e => {

    			e.poly.intersects() ? e.poly.setStyle({color: '#DE3C4B'}) : e.poly.setStyle(style);

    		});

    	});

    }

}