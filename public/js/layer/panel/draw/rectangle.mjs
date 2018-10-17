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

        _xyz.map.on('click', e => {
            let start_pnt = [_xyz.map.mouseEventToLatLng(e.originalEvent).lat, _xyz.map.mouseEventToLatLng(e.originalEvent).lng];
            layer.vertices.addLayer(L.circleMarker(_xyz.map.mouseEventToLatLng(e.originalEvent), style(layer).vertex));

            let len = layer.vertices.getLayers().length;

            if(len === 1){
                _xyz.map.on('mousemove', e => {
                    layer.trail.clearLayers();
                    layer.trail.addLayer(L.rectangle([start_pnt, [_xyz.map.mouseEventToLatLng(e.originalEvent).lat, _xyz.map.mouseEventToLatLng(e.originalEvent).lng]], style(layer).trail));
                });
            }

            if(len === 2){
                _xyz.map.off('mousemove');
                layer.trail.clearLayers();
                _xyz.map.off('click');
                _xyz.dom.map.style.cursor = '';

                layer.edited = false;

                let rect = [];
                layer.vertices.eachLayer(layer => {
                    let latlng = layer.getLatLng();
                    rect.push([latlng.lat, latlng.lng]);
                });

                layer.path.addLayer(L.rectangle(rect, style(layer).path));

                // Make select tab active on mobile device.
                //if (global._xyz.activateLocationsTab) global._xyz.activateLocationsTab();

                let xhr = new XMLHttpRequest();
                xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');
                
                let _marker = layer.path.getBounds().getCenter();
                let marker = [_marker.lng.toFixed(5), _marker.lat.toFixed(5)];

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
                    geometry: layer.path.toGeoJSON().features[0].geometry
                }));
            }
        });
    }
}