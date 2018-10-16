import _xyz from '../../../_xyz.mjs';

import style from './style.mjs';

export default (e, layer) => {
    e.stopPropagation();

    layer.edited = layer.edited ? false : true;

    console.log(layer);

    if(layer.edited && !layer.display){
        layer.display = true;
        layer.clear_icon.textContent = layer.display ? 'layers' : 'layers_clear';
        _xyz.pushHook('layers', layer.layer);
        layer.get();
    }

    layer.drawnItems = L.featureGroup().addTo(_xyz.map);
    layer.trail = L.featureGroup().addTo(_xyz.map);
    layer.path = L.featureGroup().addTo(_xyz.map);

    let coords = [];

    if(!layer.edited){
        layer.header.classList.remove('edited');
    } else {
        layer.header.classList.add('edited');

        _xyz.dom.map.style.cursor = 'crosshair';

        _xyz.map.on('click', e => {
            let start_pnt = [_xyz.map.mouseEventToLatLng(e.originalEvent).lat, _xyz.map.mouseEventToLatLng(e.originalEvent).lng];
            layer.drawnItems.addLayer(L.circleMarker(_xyz.map.mouseEventToLatLng(e.originalEvent), style(layer).vertex));
            
            let len = layer.drawnItems.getLayers().length,
                segment = [];
            
            if(len === 2) {
                let g = layer.drawnItems.toGeoJSON();
                segment = [g.features[len-2].geometry.coordinates.reverse(), g.features[len-1].geometry.coordinates.reverse()];
                layer.path.addLayer(L.polyline([segment], style(layer).path));
            }
            
            if(len > 2) {
                layer.path.clearLayers();
                coords = [];
                segment = [];
                let g = layer.drawnItems.toGeoJSON();
                
                g.features.map(item => {
                    coords.push(item.geometry.coodinates);
                    segment.push(item.geometry.coordinates.reverse());
                });
                layer.path.addLayer(L.polygon(coords, style(layer).path));
            }
            
            _xyz.map.on('mousemove', e => {
                layer.trail.clearLayers();
                
                layer.trail.addLayer(L.polyline([
                    [layer.drawnItems.getLayers()[0].getLatLng().lat, layer.drawnItems.getLayers()[0].getLatLng().lng],
                    [_xyz.map.mouseEventToLatLng(e.originalEvent).lat, _xyz.map.mouseEventToLatLng(e.originalEvent).lng], 
                    [layer.drawnItems.getLayers()[len-1].getLatLng().lat, layer.drawnItems.getLayers()[len-1].getLatLng().lng]
                ], style(layer).trail));
            });
            
            _xyz.map.on('contextmenu', e => {
                
                _xyz.map.off('mousemove');
                _xyz.map.off('contextmenu');
                _xyz.map.off('click');
                _xyz.dom.map.style.cursor = '';

                layer.trail.clearLayers();

                layer.edited = false;
                
                coords = [];
                layer.drawnItems.eachLayer(layer => {
                    coords.push([layer.getLatLng().lng, layer.getLatLng().lat]);
                });
                coords.push(coords[0]);
                
                let poly = {
                    "type": "Polygon",
                    "coordinates": [coords],
                    "properties": {}
                };

                console.log(poly);
                
                // Make select tab active on mobile device.
                if (_xyz.view.mobile.activateLocationsTab) _xyz.view.mobile.activateLocationsTab();
                
                let xhr = new XMLHttpRequest();
                xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                
                let _marker = layer.drawnItems.getBounds().getCenter(),
                    marker = [_marker.lng.toFixed(5), _marker.lat.toFixed(5)];
                    
                xhr.onload = e => {
                    if (e.target.status === 401) {
                        document.getElementById('timeout_mask').style.display = 'block';
                        //console.log(e.target.response);
                        return
                    }
                    
                    if (e.target.status === 200) {
                        layer.drawnItems.clearLayers();
                        layer.path.clearLayers();
                        
                        layer.get();
                        
                        _xyz.locations.select({
                            layer: layer.layer,
                            table: layer.table,
                            id: e.target.response,
                            marker: marker,
                            editable: true
                        });
                    }
                }
                
                /*xhr.send(JSON.stringify({
                    locale: _xyz.locale,
                    layer: layer.layer,
                    table: layer.table,
                    geometry: poly
                }));*/
                
                console.log(JSON.stringify({
                    locale: _xyz.locale,
                    layer: layer.layer,
                    table: layer.table,
                    geometry: poly
                }));
            });
        });
    }
}