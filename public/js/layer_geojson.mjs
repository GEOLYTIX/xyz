import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

import L from 'leaflet';

export default function() {

    // Assign the table based on the zoom array.
    let layer = this;

    if (layer.arrayZoom) {
        let zoom = _xyz.ws.map.getZoom(),
            zoomKeys = Object.keys(layer.arrayZoom),
            maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

        layer.table = zoom > maxZoomKey ?
            layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];
    }

    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table? 0.4: 1;

    // Request layer data when table and display are true.
    if(layer.table && layer.display && layer.locale === _xyz.ws.locale){
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest(); 

        // Build xhr request.
        let bounds = _xyz.ws.map.getBounds();      
        layer.xhr.open('GET', _xyz.ws.host + '/api/geojson/get?' + utils.paramString({
            locale: _xyz.ws.locale,
            layer: layer.layer,
            table: layer.table,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
            token: _xyz.ws.token
        }));

        // Draw layer on load event.
        layer.xhr.onload = e => {

            if (e.target.status === 200 && layer.display && layer.locale === _xyz.ws.locale){

                // Create feature collection for vector features.
                let features = JSON.parse(e.target.responseText);

                // Check for existing layer and remove from map.
                if (layer.L) _xyz.ws.map.removeLayer(layer.L);

                function applyLayerStyle(geojsonFeature){
                    if (layer.style && layer.style.theme && layer.style.theme.type === 'categorized'){

                        let val = geojsonFeature.properties[layer.style.theme.field] || null;

                        if(val) return layer.style.theme.cat[val].style;

                    }

                    if (layer.style && layer.style.theme && layer.style.theme.type === 'graduated') {

                        let style = layer.style.theme.cat[0].style;

                        let val = geojsonFeature.properties[layer.style.theme.field] || null;

                        for (let i = 0; i < layer.style.theme.cat.length; i++) {
                            if (val && val < layer.style.theme.cat[i].val) break;
                            style = layer.style.theme.cat[i].style;
                        }
                        return style;
                    }
                    return layer.style.default;
                }

                // Add geoJSON feature collection to the map.
                layer.L = L.geoJSON(features, {
                    style: applyLayerStyle,
                    pane: layer.pane[0],
                    interactive: layer.infoj? true: false,
                    pointToLayer: function(point, latlng){
                        return L.circleMarker(latlng, {
                            radius: 9,
                            pane: layer.pane[0]
                        });
                    }
                })
                    .on('click', function(e){
                    _xyz.ws.select.selectLayerFromEndpoint({
                        layer: layer.layer,
                        table: layer.table,
                        id: e.layer.feature.properties.id,
                        marker: [e.latlng.lng.toFixed(5), e.latlng.lat.toFixed(5)],
                        editable: layer.editable
                    });
                })
                    .on('mouseover', function(e){
                    e.layer.setStyle(layer.style.highlight);
                })
                    .on('mouseout', function(e){
                    e.layer.setStyle(layer.style.default);
                })
                    .addTo(_xyz.ws.map);

                layer.loader.style.display = 'none';
                layer.loaded = true;
                _xyz.ws.layersCheck();

                // Check whether vector.table or vector.display have been set to false during the drawing process and remove layer from map if necessary.
                if (!layer.table || !layer.display) _xyz.ws.map.removeLayer(layer.L);
            }
        }
        layer.xhr.send();
    }
}