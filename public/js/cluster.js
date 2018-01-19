const L = require('leaflet');
const helper = require('./helper');
const d3 = require('d3');

function getLayer(_this, _layer){

    document.getElementById(_this.vector.layers[_layer].DOM_id).disabled = false;

    _this.vector.layers[_layer].table = _this.countries[_this.country].vector[_layer].qLayer;

    // Zoom to location selected from table.
    _this.vector.dom.btnZoomLoc.addEventListener('click', function(){
        _this.map.closePopup(_this.vector.layers[_layer].popup);
        _this.map.flyToBounds(_this.vector.layers[_layer].layerSelection.getBounds());
        _this.map.fitBounds(_this.vector.layers[_layer].layerSelection.getBounds());

        if (view_mode === 'mobile') {
            if (_this.vector.layers[_layer].layerSelectionCell) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionCell);
            if (_this.vector.layers[_layer].layerSelectionLine) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionLine);

            if (_this.vector.dom.location_drop.style['display'] === 'block'){
                _this.map.panBy([0, parseInt(_this.vector.dom.location_drop.clientHeight) / 2]);
                _this.vector.dom.location_drop.style['display'] = 'none';
            }
            _this.vector.dom.btnMap.style['display'] = 'block';
        }
    });

     getLegend(_layer);

    if(_this.vector.layers[_layer].table){

        // Create new vector.xhr
        _this.vector.layers[_layer].xhr = new XMLHttpRequest();

        let bounds = _this.map.getBounds(),
            url = localhost + 'q_location?' + helper.paramString({
                layer: _this.countries[_this.country].vector[_layer].qLayer,
                qid: _this.countries[_this.country].vector[_layer].qID,
                label: _this.countries[_this.country].vector[_layer].qLabel,
                brand: _this.countries[_this.country].vector[_layer].qBrand,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth(),
                dist: getDistance(_layer)
            });

        _this.vector.layers[_layer].xhr.onload = function(){
            if(this.status === 200){
                let data = JSON.parse(this.responseText),
                    places = {
                        "type": "Feature Collection",
                        "features": []
                    };

                Object.keys(data).map(function(_key){
                    places.features.push({
                        "type": "Feature",
                        "geometry": JSON.parse(data[_key].geomj),
                        "properties": {
                            "infoj": data[_key].infoj
                        }
                    });
                });
                // break into classes
                breakdownClasses(_layer, places.features);

                if(_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);

                // add layer
                _this.vector.layers[_layer].layer = L.geoJson(places, {
                    pointToLayer: _ptl,
                    onEachFeature: _oef
                }).addTo(_this.map);

                // point to layer
                function _ptl(point, latlng){
                    let _count = point.properties.infoj.length;

                    if(_count > 1){
                        let _dot, _vArr = getCompetitors(_layer, point.properties.infoj),
                            _dotArr = [[400, _this.countries[_this.country].vector[_layer].arrayCompColours[0]]];

                    for (let i = 0; i < _vArr.length - 1; i++) {
                            let _vTot = 0;
                            for (let ii = i; ii < _vArr.length - 1; ii++) {
                                _vTot += parseInt(_vArr[ii])
                            }
                            _dotArr.push([400 * _vTot / _count, _this.countries[_this.country].vector[_layer].arrayCompColours[i + 1]]);
                        }
                        _dot = createMarker(_layer, _dotArr, true);

                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: _dot,
                                iconSize: getIconSize(_count)
                            })
                        });

                    } else {
                        let _brand = point.properties.infoj[0].brand || "other",
                            _brand_icon = createMarker(_layer, _brand);

                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: _brand_icon,
                                iconSize: getIconSize(_count)
                            })
                        });
                    }
                }

                // on each feature
                function _oef(feature, layer){

                    function layerOnClick(e){
                        let infoj = this.feature.properties.infoj,
                            count = this.feature.properties.infoj.length,
                            latlng = this.feature.geometry.coordinates.reverse();

                        console.log(infoj);

                        if(count > 1){
                            // Draw a cirle marker
                            _this.vector.layers[_layer].layerSelectionCell = L.circleMarker(latlng, {
                                radius: 30,
                                fillColor: '#ccff90',
                                fillOpacity: 0.4,
                                stroke: false,
                                interactive: false
                            }).addTo(_this.map);

                            let table = '<table cellpadding="0" cellspacing="0">';

                            for (let i = 0; i < count && i < 100; i++) {
                                table += '<tr data-id="'+ infoj[i].id +'"><td>'
                                    + infoj[i].label + '</td></tr>';
                            }
                            table += '</table>';

                            if(count > 100) table += '<caption><small>and ' + (count - 100).toString() + ' more.</small></caption>';

                            if (view_mode === 'desktop') {
                                // Populate leaflet popup with a html table and call scrolly to enable scrollbar.
                                _this.vector.layers[_layer].popup = L.popup()
                                    .setLatLng(latlng)
                                    .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                                    .openOn(_this.map);
                                require('./lscrolly')(document.querySelector('.leaflet-popup-content'));

                                // Button to close popup.
                                _this.map.on('popupclose', function(){
                                    if (_this.vector.layers[_layer].layerSelectionCell) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionCell);
                                });
                            }

                            if (view_mode === 'mobile') {
                                // Remove the line marker which connects the cell with the drop down list;
                                if (_this.vector.layers[_layer].layerSelectionLine) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionLine);

                                // Populate and display the .location_drop with the location list table.
                                _this.vector.dom.locationTable.innerHTML = table;
                                _this.vector.dom.btnMap.style['display'] = 'none';
                                _this.vector.dom.location_drop.style['display'] = 'block';

                                // Pan map according to the location of the cluster cell;
                                 let map_dom = _this.vector.dom.map,
                                    map_dom__height = map_dom.clientHeight,
                                    map_dom__margin = parseInt(map_dom.style.marginTop),
                                    shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(_this.vector.dom.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);

                                _this.map.setZoomAround(latLng, _this.map.getZoom() + 1, {animate: false});
                                _this.map.panBy([0, -shiftY]);

                                // Draw line marker which connects hex cell with drop down.
                                _this.vector.layers[_layer].layerSelectionLine = L.marker(latLng, {
                                    icon: L.icon({
                                        iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                                        iconSize: [3, 1000],
                                        iconAnchor: [2, 1000]
                                    })
                                }).addTo(_this.map);

                                // Button event to close the .location_drop.
                                _this.vector.dom.locDropClose.addEventListener('click', function(){
                                    if (_this.vector.layers[_layer].layerSelectionCell) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionCell);
                                    if (_this.vector.layers[_layer].layerSelectionLine) _this.map.removeLayer(_this.vector.layers[_layer].layerSelectionLine);

                                    _this.map.panBy([0, parseInt(_this.vector.dom.location_drop.clientHeight) / 2]);

                                    _this.vector.dom.location_drop.style['display'] = 'none';
                                    _this.vector.dom.btnMap.style['display'] = 'block';
                                });
                            }
                            // Zoom in one step.
                            _this.map.setZoomAround(latlng, _this.map.getZoom() + 1);

                            // Add event to query location info to the location list records.
                            let location_table_rows = document.querySelectorAll('.location_table tr');

                            for (let i = 0; i < location_table_rows.length; i++) {
                                location_table_rows[i].addEventListener('click', function () {
                                    selectLayer(this.dataset.id);
                                });
                            }

                        } else {
                             selectLayer(infoj[0].id);
                        }
                    }

                    function layerOnMouseover(){
                        this.setIcon(L.icon({
                            iconUrl: this.options.icon.options.iconUrl,
                            iconSize: this.options.icon.options.iconSize,
                            shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
                            shadowSize: this.options.icon.options.iconSize + 20,
                        }));
                    }

                    function layerOnMouseout(){
                        this.setIcon(L.icon({
                            iconUrl: this.options.icon.options.iconUrl,
                            iconSize: this.options.icon.options.iconSize
                        }));
                    }

                    layer.on({
                        click: layerOnClick,
                        mouseover: layerOnMouseover,
                        mouseout: layerOnMouseout
                    });
                }
            }
        }
        _this.vector.layers[_layer].xhr.open("GET", url);
        _this.vector.layers[_layer].xhr.send();
    }

    //Select a feature
    _this.vector.layers[_layer].selectLayer = selectLayer;

    function selectLayer(id){

        let xhr = new XMLHttpRequest();

        let url = localhost + 'q_location_info?' + helper.paramString({
            qid: _this.countries[_this.country].vector[_layer].qID,
            id: id.toString().split('.')[1] || id,
            layer: _this.countries[_this.country].vector[_layer].qLayer,
            vector: _this.countries[_this.country].vector[_layer].qVector || null
        });

        xhr.open("GET", url);

        // Display the selected layer feature on load event.
       xhr.onload = function(){
            if(this.status === 200){
                let json = JSON.parse(this.responseText),
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);

                // Remove layerSelection from map if exists.
                if (_this.vector.layers[_layer].layerSelection) _this.map.removeLayer(_this.vector.layers[_layer].layerSelection);

                // Create layerSelection from geoJSON and add to map.
                _this.vector.layers[_layer].layerSelection = L.geoJson({
                    'type': 'Feature',
                    'geometry': geomj
                }, {
                    pane: 'locationSelection',
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: L.icon({
                                iconUrl: _this.location.marker,
                                iconSize: [80, 40],
                                iconAnchor: [40, 40]
                            }),
                            interactive: false
                        });
                    }
                }).addTo(_this.map);
                 _this.locale.layersCheck(_layer + '_select', true);

                // Select the associated vector layer
                //if (_this.vector.layers['Postal codes'].display && json[0].vector){
                    // selection not ready yet
                    //_this.vector.selectLayer(json[0].vector);
                //}

                // Assign info fields to info table.
                let table = '';

                Object.keys(infoj).map(function (_key) {
                    let info_field = _key.substring(0,6) === 'empty_' ? '' : _key;
                    if (infoj[_key] !== null) table += '<tr><td>' + info_field + '</td><td>' + infoj[_key] + '</td></tr>';
                });

                // log infoj
                setTimeout(function(){
                    console.log(infoj);
                }, 300);

                // Add hook for the location
                if(_this.hooks.selected){
                    _this.hooks.selected = _this.pushHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + id);
                } else {
                    _this.hooks.selected = _this.pushHook([], _this.respaceHook(_layer) + "." + id);
                }
                _this.setHook("selected", _this.hooks.selected);


                // Move info container up if display is mobile and info container is less than 200px in view.
                if (view_mode === 'mobile' && document.querySelector('html, body').scrollTop < 200){
                    document.querySelector('html, body').scrollTop = 200;
                }
            }
        }
        xhr.send();
        _this.locale.layersCheck(_layer + '_select', false);
    }

    // Markers and legend

    // show legend
    function getLegend(){
        hideLegend();
        createLegend();
    }

    // hide legend
    _this.vector.layers[_layer].hideLegend = hideLegend;

    function hideLegend(){
        if(_this.vector.layers[_layer].legend_id) document.getElementById(_this.vector.layers[_layer].legend_id).innerHTML = "";
    }

    // build legend svg
    function createLegend(){

        // create legend id
        _this.vector.layers[_layer].legend_id = _this.vector.dom.locLegendId + "_" + _this.respaceHook(_layer, "_");

        // add legend container
        let node = document.createElement('div');
        node.id = _this.vector.layers[_layer].legend_id;
        document.getElementById(_this.vector.dom.locLegendId).appendChild(node);

        let _keys = Object.keys(_this.countries[_this.country].vector[_layer].markerStyle),
            _len = _keys.length,
            _comp_len = _this.countries[_this.country].vector[_layer].competitors.length,

            x = 10, y, y1 = 30, y2 = 30, r = 8,

            _svg = d3.select('#' + _this.vector.layers[_layer].legend_id)
            .append('svg')
            .attr("width", 280)
            .attr("height", 2.5*r*(Math.ceil(_len/2+1) + _comp_len) + 50);

        // title
        _svg.append("text")
                .attr("x", 0)
                .attr("y", y1-5)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .style("font-size", "14px")
                .style("font-weight", "800")
                .text(_layer + " legend");

        // legend content
        for(let i = 0; i < _len; i++){

            i < _len/2 ? (y1 = y1 + 20, y = y1) : (x = 150, y2 = y2 + 20, y = y2);

            let _style = _this.countries[_this.country].vector[_layer].markerStyle[_keys[i]].style;


            for(let j = 0; j < _style.length; j++){
                _svg.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", _style[j][0]*8/400)
                    .style("fill", _style[j][1]);
            }

            _svg.append("text")
                .attr("x", x+10)
                .attr("y", y)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .style("font-size", "12px")
                .text(_this.countries[_this.country].vector[_layer].markerStyle[_keys[i]].label);
        }

        // add section for clusters and competitors
        // title
        for(let k = 0; k < _this.countries[_this.country].vector[_layer].competitors.length; k++){
            _svg.append("circle")
            .attr("cx", 10)
            .attr("cy", y + 50)
            .attr("r", 10 - 3*k)
            .style("fill", _this.countries[_this.country].vector[_layer].arrayCompColours[k]);
        }
        _svg.append("text")
            .attr("x", 25)
            .attr("y", y + 50)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .style("font-size", "14px")
            .style("font-weight", "800")
            .text("Multiple locations");

        // list competitors
        for(let l = 0; l < _this.countries[_this.country].vector[_layer].competitors.length; l++){

            let _key = _this.countries[_this.country].vector[_layer].competitors[l];

            _svg.append("circle")
            .attr("cx", 30)
            .attr("cy", y + 70 + 20*l)
            .attr("r", 7)
            .style("fill", _this.countries[_this.country].vector[_layer].arrayCompColours[l]);

            _svg.append("text")
            .attr("x", 40)
            .attr("y", y + 70 + 20*l)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .style("font-size", "12px")
            .text(_this.countries[_this.country].vector[_layer].markerStyle[_key].label);
        }
        _this.vector.layers[_layer].legend = document.getElementById(_this.vector.layers[_layer].legend_id);
    }

    function createMarker(_layer, _val, _competition){

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        svg.setAttribute("width", 1000);
        svg.setAttribute("height", 1000);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        return drawIcon(svg, _layer, _val, _competition);
    }

    function drawIcon(_svg, _layer, _val, _competition){

        let _style;

        if(_competition === undefined || _competition !== true) {
            _style = _this.countries[_this.country].vector[_layer].markerStyle[_val].style;
        } else {
            _style = _val;
        }

        let _len = _style.length;

        for(let i = 0; i < _len; i++){
            // draw svg
            let _circle = document.createElement("circle");

            _circle.setAttribute("cx", 500);
            _circle.setAttribute("cy", 500);
            _circle.setAttribute("r", _style[i][0]);
            _circle.style.fill = _style[i][1];

            _svg.appendChild(_circle);
        }
        return ("data:image/svg+xml," + encodeURIComponent(_svg.outerHTML));
    }

    _this.vector.layers[_layer].clearLayers = clearLayers;
    function clearLayers(){
        if(_this.vector.layers[_layer].layer) _this.map.removeLayer(_this.vector.layers[_layer].layer);
        if(_this.vector.layers[_layer].layerSelection) _this.map.removeLayer(_this.vector.layers[_layer].layerSelection);
        if(_this.vector.layers[_layer].legend) _this.vector.layers[_layer].hideLegend();
        
        // check selected multi hook
        if(_this.vector.layers[_layer].selected && _this.hooks.selected){
            _this.hooks.selected = _this.popHook(_this.hooks.selected.split(","), _this.respaceHook(_layer) + "." + _this.vector.layers[_layer].selected);
            _this.vector.layers[_layer].selected = null;
            if(_this.hooks.selected){
                _this.setHook("selected", _this.hooks.selected);
            } else {
                _this.removeHook("selected");   
            }
        } else {
            _this.removeHook("selected"); 
        }
    }


    // Tools for clustering

    // Get clustering distance from settings based on zoom level
    function getDistance(_layer){
        let zoom = _this.map.getZoom(),
            len = Object.keys(_this.countries[_this.country].vector[_layer].clusterDistance).length,
            _min_cZoom = Object.keys(_this.countries[_this.country].vector[_layer].clusterDistance)[0],
            _max_cZoom = Object.keys(_this.countries[_this.country].vector[_layer].clusterDistance)[len-1];

        if(zoom < parseInt(_min_cZoom)) zoom = _min_cZoom;
        else if(zoom > parseInt(_max_cZoom)) zoom = _max_cZoom
        else zoom = zoom.toString();

        return _this.countries[_this.country].vector[_layer].clusterDistance[zoom];
    }

    // Get classes for clustering
    function breakdownClasses(_layer, features){
        let vals = [], len = features.length;

        if(len) {
            for(let i=0; i< len; i++){
                vals.push(features[i].properties.infoj.length);
            }

            let min = vals.reduce((a, b) => Math.min(a, b)),
                max = vals.reduce((a, b) => Math.max(a, b)),
                avg = getAvg(vals),
                step_lower = (avg - min) / 3, step_upper = (max - avg) / 4;

            module.arrayMarker = [];
            module.arrayMarker[0]= min;
            module.arrayMarker[1]= min + step_lower;
            module.arrayMarker[2]= min + 2*step_lower;
            module.arrayMarker[3]= avg;
            module.arrayMarker[4]= avg + step_upper;
            module.arrayMarker[5]= avg + 2*step_upper;
            module.arrayMarker[6]= avg + 3*step_upper;
            module.arrayMarker[7]= max;
        }
    }

    // Get average
    function getAvg(_values){
        let _len = _values.length, _avg;
        if(_len){
            let _sum = _values.reduce((a, b) => a + b);
            _avg = _sum / _values.length;
        }
        return _avg;
    }

    // Get icon size
    function getIconSize(_val){
        let _lower = 20,
            _zoom = _this.map.getZoom(),
            _size = _val < module.arrayMarker[1] ?
            10 : _val < module.arrayMarker[2] ?
            14 : _val < module.arrayMarker[3] ?
            18 : _val < module.arrayMarker[4] ?
            22 : _val < module.arrayMarker[5] ?
            26 : _val < module.arrayMarker[6] ? 28 : 32;

        if(_val === 1) _size = _zoom*2;
        // Make max stand out only if higher than _lower
        if(_val === module.arrayMarker[7] && _val > _lower) _size = 44;
        return _size;
    }

    // Split by competitor
    function getCompetitors(_layer, _arr){
        let v = [0, 0, 0], len = _arr.length || 0, vals = [],
            c = _this.countries[_this.country].vector[_layer].competitors.length || 0;

        for(let i = 0; i<len; i++){
             vals.push(_arr[i].brand);
        }

        for(let j = 0; j < c; j++){
            for(let k = 0; k < vals.length; k++){
                if(vals[k] === _this.countries[_this.country].vector[_layer].competitors[j]){
                    v[j]++;
                }
            }
        }
        return v;
    }

}

module.exports = {
    getLayer: getLayer
}