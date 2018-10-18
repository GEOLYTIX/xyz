import _xyz from '../../../_xyz.mjs';
import style from './style.mjs';
import { switchState } from './_draw.mjs';

import circle from '@turf/circle';
import distance from '@turf/distance';
import helpers from '@turf/helpers';

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

            layer.vertices.addLayer(L.circleMarker(_xyz.map.mouseEventToLatLng(e.originalEvent), style(layer).vertex));

            let len = layer.vertices.getLayers().length, 
                o, c, s, r, // origin, cursor, segment, radius
                options = {units: "metres", steps: 128}; // circle options

            o = helpers.point([layer.vertices.getLayers()[0].getLatLng().lng, layer.vertices.getLayers()[0].getLatLng().lat]);

            if(len === 1){
                _xyz.map.on('mousemove', e => {
                    layer.trail.clearLayers();
                    c = helpers.point([_xyz.map.mouseEventToLatLng(e.originalEvent).lng, _xyz.map.mouseEventToLatLng(e.originalEvent).lat]);
                    r = distance(o, c, options).toFixed(2);
                    
                    layer.trail.addLayer(L.circle([layer.vertices.getLayers()[0].getLatLng().lat, layer.vertices.getLayers()[0].getLatLng().lng], Object.assign(style(layer).path, {radius: parseFloat(r)})));
                });
            }

            if(len === 2){
                layer.trail.clearLayers();
                s = helpers.point([layer.vertices.getLayers()[len-1].getLatLng().lng, layer.vertices.getLayers()[len-1].getLatLng().lat]);
                r = distance(o, s, options).toFixed(2);
                layer.trail.clearLayers();
                _xyz.dom.map.style.cursor = '';
                _xyz.map.off('mousemove');
                _xyz.map.off('click');

                layer.path.addLayer(L.circle([layer.vertices.getLayers()[0].getLatLng().lat, layer.vertices.getLayers()[0].getLatLng().lng], Object.assign(style(layer).path, {radius: parseFloat(r)})));

                // Make select tab active on mobile device.
                //if (_xyz.view.mobile.activateLocationsTab) _xyz.view.mobile.activateLocationsTab(); // resolve this name

                let xhr = new XMLHttpRequest();
                xhr.open('POST', _xyz.host + '/api/location/new?token=' + _xyz.token);
                xhr.setRequestHeader('Content-Type', 'application/json');

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
                            marker: o.geometry.coordinates,
                            editable: true
                        });
                    }
                }

                xhr.send(JSON.stringify({
                    locale: _xyz.locale,
                    layer: layer.key,
                    table: layer.table,
                    geometry: circle(o, r, options).geometry
                }));
            }
        });
    }
}