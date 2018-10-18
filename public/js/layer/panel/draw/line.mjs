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

    if(!layer.edited){
        layer.header.classList.remove('edited');
    } else {
        layer.header.classList.add('edited');
        _xyz.dom.map.style.cursor = 'crosshair';

        layer.vertices = L.featureGroup().addTo(_xyz.map);
        layer.trail = L.featureGroup().addTo(_xyz.map);
        layer.path = L.featureGroup().addTo(_xyz.map);

        let coords = [];

        _xyz.map.on('click', e => {
            let start_pnt = [e.latlng.lat, e.latlng.lng];

            layer.vertices.addLayer(L.circleMarker(e.latlng, style(layer).vertex));

            let len = layer.vertices.getLayers().length, part = [];

            if(len > 1){
                part = [
                    [layer.vertices.getLayers()[len-2].getLatLng().lat, layer.vertices.getLayers()[len-2].getLatLng().lng],
                    [layer.vertices.getLayers()[len-1].getLatLng().lat, layer.vertices.getLayers()[len-1].getLatLng().lng]
                ];
                layer.path.addLayer(L.polyline([part], style(layer).path));
            }

            _xyz.map.on('mousemove', e => {
                layer.trail.clearLayers();
                layer.trail.addLayer(L.polyline(
                    [start_pnt, 
                        [e.latlng.lat, e.latlng.lng]
                    ], 
                    style(layer).trail));
                });

            _xyz.map.on('contextmenu', e => {
                _xyz.map.off('mousemove');
                layer.trail.clearLayers();
                
                _xyz.map.off('contextmenu');
                _xyz.map.off('contextmenu');
                _xyz.map.off('click');
                _xyz.dom.map.style.cursor = '';
                
                layer.edited = false;
                coords = [];

                layer.path.eachLayer(layer => {
                    let latlngs = layer.getLatLngs();
                    if(latlngs) latlngs.map(latlng => {
                        let coord = [];
                        latlng.map(l => coord.push([l.lng, l.lat]));
                        
                        coords.push(coord);
                    });
                });

                let multiline = {
                    "type": "MultiLineString",
                    "coordinates": coords,
                    "properties": {}
                };

                // Make select tab active on mobile device.
                //if (global._xyz.activateLocationsTab) global._xyz.activateLocationsTab();

                let xhr = new XMLHttpRequest();
                xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');

                let _marker = layer.vertices.getLayers()[Math.ceil(len/2)].getLatLng();
                let marker = [_marker.lng, _marker.lat];

                xhr.onload = e => {

                    if (e.target.status === 401) {
                        document.getElementById('timeout_mask').style.display = 'block';
                        //console.log(e.target.response);
                        return
                    }
                    
                    if (e.target.status === 200) {

                        layer.vertices.clearLayers();
                        layer.path.clearLayers();
                        layer.edited = false;

                        layer.header.classList.remove('edited'); // this should happen on final save, delete, unselect

                        layer.get();

                        switchState(btn);

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
                    geometry: multiline
                }));
            });
        });
    }
}