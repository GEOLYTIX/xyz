import _xyz from '../../../_xyz.mjs';
import style from './style.mjs';
import { switchState } from './_draw.mjs';

import circle from '@turf/circle';
import distance from '@turf/distance';
import helpers from '@turf/helpers';
//import turf from 'turf';


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
            let start_pnt = [
                _xyz.map.mouseEventToLatLng(e.originalEvent).lat, 
                _xyz.map.mouseEventToLatLng(e.originalEvent).lng
            ];

            layer.vertices.addLayer(L.circleMarker(_xyz.map.mouseEventToLatLng(e.originalEvent), style(layer).vertex));

            let len = layer.vertices.getLayers().length;

            if(len === 1){
                layer.trail.clearLayers();
                let _start_pnt = start_pnt.reverse();
                let o = helpers.point(_start_pnt.reverse());
                let options = {units: "metres"}, d, r;

                _xyz.map.on('mousemove', e => {
                    layer.trail.clearLayers();
                    d = helpers.point([_xyz.map.mouseEventToLatLng(e.originalEvent).lng, _xyz.map.mouseEventToLatLng(e.originalEvent).lat]);
                    r = distance(o, d, options).toFixed(2);
                    //r = 10000;
                    console.log(r);

                    //style(layer).trail.radius = r;
                    let segment = [start_pnt, [_xyz.map.mouseEventToLatLng(e.originalEvent).lat, _xyz.map.mouseEventToLatLng(e.originalEvent).lng]];
                    //console.log(Object.assign(style(layer).trail, {radius: r}));
                    //L.circle(start_pnt, Object.assign(style(layer).trail, {radius: 7000})).addTo(_xyz.map);
                    //layer.trail.addLayer(L.circle(start_pnt, style(layer).trail));
                    layer.trail.addLayer(L.circleMarker(start_pnt, Object.assign(style(layer).trail, {radius: parseFloat(r)})));
                    //layer.trail.addLayer(L.polyline([segment], style(layer).trail));
                   
                    //console.log(layer.trail.getLayers().length);
                    //console.log(layer.trail.getLayers());
                });
                //let live_latlng = _xyz.map.mouseEventToLatLng(e.originalEvent);
                //console.log(distance());
                //r = L.CRS.distance(layer.vertices.getLayers()[0].getLatLng(), _xyz.map.mouseEventToLatLng(e.originalEvent));
                // draw live circle between vertices and mouse
                //console.log(r);
                //layer.trail.addLayer(L.circle(layer.vertices.getLayers[0].getLatLng()), style(layer.trail));
            }

            if(len > 1){
                _xyz.dom.map.style.cursor = '';
                _xyz.map.off('mousemove');
                _xyz.map.off('click');
            }

            
        });
    }
}