import _xyz from '../../_xyz.mjs';

import L from 'leaflet';

export default layer => {

    // Assign the table based on the zoom array.
    let zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);

    layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];
    
    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table? 0.4: 1;

    // Request layer data when table and display are true.
    if(layer.table && layer.display && layer.locale === _xyz.locale){
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest(); 
        
        // Open & send vector.xhr;
        let bounds = _xyz.map.getBounds();

        layer.xhr.open('GET', _xyz.host + '/api/grid/get?' + _xyz.utils.paramString({
            locale: _xyz.locale,
            layer: layer.layer,
            table: layer.table,
            size: layer.grid_size,
            color: layer.grid_color,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth(),
            token: _xyz.token
        }));

        // Draw layer on load event.
        layer.xhr.onload = e => {

            if (e.target.status === 200 && layer.display && layer.locale === _xyz.locale) {

                // Check for existing layer and remove from map.
                if (layer.L) _xyz.map.removeLayer(layer.L);

                // Add geoJSON feature collection to the map.
                layer.L = new L.geoJson(processGrid(JSON.parse(e.target.responseText)), {
                    pointToLayer: function (feature, latlng) {

                        // Distribute size between min, avg and max.
                        let size = feature.properties.size <= layer.sizeAvg ?
                            7 + 7 / layer.sizeAvg * feature.properties.size :
                            14 + 7 / (layer.sizeMax - layer.sizeAvg) * (feature.properties.size - layer.sizeAvg);

                        // Distribute color index between min, avg and max. Reduce index by 1 if index exceeds style.range.
                        let n = layer.style.range.length,
                            color = feature.properties.color <= layer.colorAvg ?
                                n / 2 / layer.colorAvg * feature.properties.color :
                                n / 2 + n / 2 / (layer.colorMax - layer.colorAvg) * (feature.properties.color - layer.colorAvg);
                        if (parseInt(color) === n) color -= 1;

                        // Return L.Marker with icon as style to pointToLayer.
                        return L.marker(
                            latlng,
                            {
                                icon: L.icon({
                                    iconSize: size,
                                    iconUrl: _xyz.utils.svg_symbols({type: "dot", style: {color: layer.style.range[parseInt(color)] || '#C0C0C0'}})
                                }),
                                pane: layer.pane[0],
                                interactive: false
                            });
                    }
                }).addTo(_xyz.map);

                layer.loader.style.display = 'none';
                layer.loaded = true;
                _xyz.layersCheck();

            }
        };
        layer.xhr.send();
        //_xyz.layersCheck();
        
    }

    function processGrid(data){
        let dots = {
                type: "FeatureCollection",
                features: []
            };
        layer.sizeAvg = 0;
        layer.colorAvg = 0;
        data.map(function(record){

            // 0 lat
            // 1 lon
            // 2 size
            // 3 color
            if (parseFloat(record[2]) > 0) {
                record[2] = isNaN(record[2]) ? record[2] : parseFloat(record[2]);
                record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);

                // Check for grid_ratio
                if (layer.grid_ratio && record[3] > 0) record[3] /= record[2]

                layer.sizeAvg += parseFloat(record[2]);
                layer.colorAvg += isNaN(record[3]) ? 0 : parseFloat(record[3]);

                dots.features.push({
                    "geometry": {
                        "type": "Point",
                        "coordinates": [record[0],record[1]]
                    },
                    "type": "Feature",
                    "properties": {
                        "size": parseFloat(record[2]),
                        "color": isNaN(record[3]) ? record[3] : parseFloat(record[3])
                    }
                });
            }
        });

        layer.sizeMin = _xyz.utils.getMath(data, 2, 'min');
        layer.sizeAvg /= dots.features.length;
        layer.sizeMax = _xyz.utils.getMath(data, 2, 'max');

        layer.colorMin = _xyz.utils.getMath(data, 3, 'min');
        layer.colorAvg /= dots.features.length;
        layer.colorMax = _xyz.utils.getMath(data, 3, 'max');

        let digits = layer.grid_ratio ? 2 : 0;
        document.getElementById('grid_legend_size__min').textContent = layer.sizeMin.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_size__avg').textContent = layer.sizeAvg.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_size__max').textContent = layer.sizeMax.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_color__min').textContent = layer.colorMin.toLocaleString('en-GB', {maximumFractionDigits: digits});
        document.getElementById('grid_legend_color__avg').textContent = layer.colorAvg.toLocaleString('en-GB', {maximumFractionDigits: digits});
        document.getElementById('grid_legend_color__max').textContent = layer.colorMax.toLocaleString('en-GB', {maximumFractionDigits: digits});

        return dots
    }
}