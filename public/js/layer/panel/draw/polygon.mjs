import _xyz from '../../../_xyz.mjs';
import style from './style.mjs';
import { switchState } from './_draw.mjs';

export default (e, layer) => {
    e.stopPropagation();

    layer.edited = layer.edited ? false : true;

    let btn = e.target;

    if(layer.edited && !layer.display){
        layer.display = true;
        layer.toggle.textContent = layer.display ? 'layers' : 'layers_clear';
        _xyz.hooks.push('layers', layer.key);
        layer.get();
    }

    let coords = [];

    if(!layer.edited){
        layer.header.classList.remove('edited');
    } else {
        layer.header.classList.add('edited');

        _xyz.dom.map.style.cursor = 'crosshair';

        layer.vertices = L.featureGroup().addTo(_xyz.map);
        layer.trail = L.featureGroup().addTo(_xyz.map);
        layer.path = L.featureGroup().addTo(_xyz.map);

        _xyz.map.on('click', e => {
            let start_pnt = [e.latlng.lat, e.latlng.lng];
            layer.vertices.addLayer(L.circleMarker(e.latlng, style(layer).vertex));
            
            let len = layer.vertices.getLayers().length,
                segment = [];
            
            if(len === 2) {
                segment = [
                    [layer.vertices.getLayers()[len-2].getLatLng().lat, layer.vertices.getLayers()[len-2].getLatLng().lng],
                    [layer.vertices.getLayers()[len-1].getLatLng().lat, layer.vertices.getLayers()[len-1].getLatLng().lng]
                ];
                layer.path.addLayer(L.polyline([segment], style(layer).path));
            }
            
            if(len > 2) {
                layer.path.clearLayers();
                coords = [];
                segment = [];

                layer.vertices.eachLayer(layer => {
                    let latlng = [layer.getLatLng().lng, layer.getLatLng().lat];
                    coords.push(latlng);
                    segment.push(latlng.reverse());
                });

                layer.path.addLayer(L.polygon(coords, style(layer).path));
            }
            
            _xyz.map.on('mousemove', e => {
                layer.trail.clearLayers();
                
                layer.trail.addLayer(L.polyline([
                    [layer.vertices.getLayers()[0].getLatLng().lat, layer.vertices.getLayers()[0].getLatLng().lng],
                    [e.latlng.lat,e.latlng.lng], 
                    [layer.vertices.getLayers()[len-1].getLatLng().lat, layer.vertices.getLayers()[len-1].getLatLng().lng]
                ], style(layer).path));
            });
            
            _xyz.map.on('contextmenu', e => {
                
                _xyz.map.off('mousemove');
                _xyz.map.off('contextmenu');
                _xyz.map.off('click');
                _xyz.dom.map.style.cursor = '';

                layer.trail.clearLayers();

                layer.edited = false;
                
                coords = [];
                layer.vertices.eachLayer(layer => {
                    coords.push([layer.getLatLng().lng, layer.getLatLng().lat]);
                });
                coords.push(coords[0]);
                
                let poly = {
                    "type": "Polygon",
                    "coordinates": [coords],
                    "properties": {}
                };
                
                // Make select tab active on mobile device.
                //if (_xyz.view.mobile.activateLocationsTab) _xyz.view.mobile.activateLocationsTab(); // resolve this name
                
                let xhr = new XMLHttpRequest();
                xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                
                let _marker = layer.vertices.getBounds().getCenter(),
                    marker = [_marker.lng.toFixed(5), _marker.lat.toFixed(5)];
                    
                xhr.onload = e => {
                    if (e.target.status === 401) {
                        document.getElementById('timeout_mask').style.display = 'block';
                        //console.log(e.target.response);
                        return
                    }
                    
                    if (e.target.status === 200) {
                        layer.vertices.clearLayers();
                        layer.path.clearLayers();
                        
                        layer.get();

                        switchState(btn); // jumps back to select state;
                        
                        _xyz.locations.select({
                            layer: layer.key,
                            table: layer.table,
                            id: e.target.response,
                            marker: marker,
                            editable: true
                        });
                    }
                }
                
                xhr.send(JSON.stringify({
                    locale: _xyz.locale,
                    layer: layer.key,
                    table: layer.table,
                    geometry: poly
                }));
            });
        });
    }
}