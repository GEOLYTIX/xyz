const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

function getLayer(){

    // Assign the table based on the zoom array.
    let layer = this,
        zoom = _xyz.map.getZoom(),
        zoomKeys = Object.keys(layer.arrayZoom),
        maxZoomKey = parseInt(zoomKeys[zoomKeys.length - 1]);
        layer.table = zoom > maxZoomKey ?
        layer.arrayZoom[maxZoomKey] : zoom < zoomKeys[0] ?
            null : layer.arrayZoom[zoom];
    
    // Make drawer opaque if no table present.
    layer.drawer.style.opacity = !layer.table? 0.4: 1;

    // Request layer data when table and display are true.
    if(layer.table && layer.display){
        layer.loaded = false;
        layer.loader.style.display = 'block';
        layer.xhr = new XMLHttpRequest(); 
        
        // Open & send vector.xhr;
        let bounds = _xyz.map.getBounds();

        layer.xhr.open('GET', localhost + 'q_grid?' + utils.paramString({
            dbs: layer.dbs,
            table: layer.table,
            c: layer.qCount,
            v: layer.qValue,
            west: bounds.getWest(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            north: bounds.getNorth()
        }));

        // Draw layer on load event.
        layer.xhr.onload = function () {
            if (this.status === 200) {

                // Check for existing layer and remove from map.
                if (layer.L) _xyz.map.removeLayer(layer.L);

                // Add geoJSON feature collection to the map.
                layer.L = new L.geoJson(processGrid(JSON.parse(this.responseText)), {
                    pointToLayer: function (feature, latlng) {

                        // Distribute size between min, avg and max.
                        let size = feature.properties.c <= layer.sizeAvg ?
                            7 + 7 / layer.sizeAvg * feature.properties.c :
                            14 + 7 / (layer.sizeMax - layer.sizeAvg) * (feature.properties.c - layer.sizeAvg);

                        // Distribute color index between min, avg and max. Reduce index by 1 if index exceeds range of colorScale.
                        let n = _xyz.layers.colorScale.length,
                            color = feature.properties.v <= layer.colorAvg ?
                                n / 2 / layer.colorAvg * feature.properties.v :
                                n / 2 + n / 2 / (layer.colorMax - layer.colorAvg) * (feature.properties.v - layer.colorAvg);
                        if (parseInt(color) === n) color -= 1;

                        // Return L.Marker with icon as style to pointToLayer.
                        return L.marker(
                            latlng,
                            {
                                icon: L.icon({
                                    iconUrl: svg_symbols.dot(_xyz.layers.colorScale[parseInt(color)]),
                                    iconSize: size
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
        let avg_c = 0,
            avg_v = 0,
            dots = {
                type: "FeatureCollection",
                features: []
            };

        data.map(function(record){

            // 0 lat
            // 1 lon
            // 2 count
            // 3 value
            if (parseFloat(record[2]) > 0) {
                record[2] = isNaN(record[2]) ? record[2] : parseFloat(record[2]);
                record[3] = isNaN(record[3]) ? record[3] : parseFloat(record[3]);

                // Make the value [4]
                if (layer.chkGridRatio.checked && record[3] > 0) record[3] /= record[2]

                avg_c += parseFloat(record[2]);
                avg_v += isNaN(record[3]) ? 0 : parseFloat(record[3]);

                dots.features.push({
                    "geometry": {
                        "type": "Point",
                        "coordinates": [record[0],record[1]]
                    },
                    "type": "Feature",
                    "properties": {
                        "c": parseFloat(record[2]),
                        "v": isNaN(record[3]) ? record[3] : parseFloat(record[3])
                    }
                });
            }
        });

        layer.sizeMin = utils.getMath(data, 2, 'min');
        layer.sizeAvg = avg_c / dots.features.length;
        layer.sizeMax = utils.getMath(data, 2, 'max');

        layer.colorMin = utils.getMath(data, 3, 'min');
        layer.colorAvg = avg_v / dots.features.length;
        layer.colorMax = utils.getMath(data, 3, 'max');

        let digits = layer.chkGridRatio.checked ? 2 : 0;
        document.getElementById('grid_legend_size__min').textContent = layer.sizeMin.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_size__avg').textContent = layer.sizeAvg.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_size__max').textContent = layer.sizeMax.toLocaleString('en-GB', {maximumFractionDigits: 0});
        document.getElementById('grid_legend_color__min').textContent = layer.colorMin.toLocaleString('en-GB', {maximumFractionDigits: digits});
        document.getElementById('grid_legend_color__avg').textContent = layer.colorAvg.toLocaleString('en-GB', {maximumFractionDigits: digits});
        document.getElementById('grid_legend_color__max').textContent = layer.colorMax.toLocaleString('en-GB', {maximumFractionDigits: digits});

        return dots
    }
}

// _xyz.grid.statFromGeoJSON = function (feature) {
//     let xhr = new XMLHttpRequest();
//     xhr.open('POST', 'q_grid_info');
//     xhr.setRequestHeader("Content-Type", "application/json");
//     xhr.onload = function () {
//         if (this.status === 200) {
//             feature.infoj = JSON.parse(this.response);
//             _xyz.select.addFeature(feature);
//         }
//     }
//     xhr.send(JSON.stringify({
//         infoj: _xyz.countries[_xyz.country].grid.infoj,
//         database: _xyz.countries[_xyz.country].grid.database,
//         geometry: feature.geometry
//     }));
// }

module.exports = {
    getLayer: getLayer
}