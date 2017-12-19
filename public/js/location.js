const L = require('leaflet');
const helper = require('./helper');
const svg_dot = require('./svg_dot');
const svg_builder = require('./svg_builder');

module.exports = function(_this){
    
    _this.locale.location = function(change_country){
        // Remove existing layer and layerSelection.
        if (_this.location.layer) _this.map.removeLayer(_this.location.layer);
        if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);
        if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
        if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);
        
        // Check for location display hook.
        if (_this.hooks.location || _this.location.default) {
            toggleLocationLayer(true);
        } else {
            _this.location.display = false;
        }
        
        // Remove the location_id hook when country is changed or select feature if hook exists
        if (change_country) {
            _this.removeHook('location_id');
            _this.location.container.style['marginLeft'] = '0';
            _this.location.infoTable.innerHTML = '';
        } else if (_this.hooks.location_id) {
            selectLayer(_this.hooks.location_id);
        }
    }
    
    _this.locale.location();
    
    // Toogle visibility of the location layer.
    document.getElementById('btnLocation--toggle').addEventListener('click', toggleLocationLayer);
    
    // Zoom to location selected from table
    document.getElementById('btnZoomLoc').addEventListener('click', function(){
        _this.map.closePopup(_this.location.popup);
        _this.map.flyToBounds(_this.location.layerSelection.getBounds());
        _this.map.fitBounds(_this.location.layerSelection.getBounds());
        
        if (view_mode === 'mobile') {
            if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
            if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);

            if (_this.location.location_drop.style['display'] === 'block'){
                _this.map.panBy([0, parseInt(_this.location.location_drop.clientHeight) / 2]);
                _this.location.location_drop.style['display'] = 'none';
            }
            document.querySelector('.map_button').style['display'] = 'block';
        }
    });
    
    // Unselect location, clear info, remove hook and set container marginLeft to 0.
    document.getElementById('btnLocation--off').addEventListener('click', function(){
        if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);
        _this.removeHook('location_id');
        _this.locale.layersCheck('locationSelect', null);
        
        // Reset module panel
        _this.location.container.style['marginLeft'] = '0';
        _this.location.infoTable.innerHTML = '';
    });
    
    function toggleLocationLayer(override){
        let btn = document.getElementById('btnLocation--toggle');
        helper.toggleClass(btn, 'on');
        if (_this.location.display === false || override === true) {
            _this.location.display = true;
            btn.innerHTML = 'Turn locations off';
            _this.setHook('location', true);
            getLayer();
        } else {
            _this.location.display = false;
            btn.innerHTML = 'Turn locations on';
            _this.removeHook('location');
            if (_this.location.layer) _this.map.removeLayer(_this.location.layer);
            _this.locale.layersCheck('location', null);
        }
    }
    
    // Get location layer
    _this.location.getLayer = getLayer;
    
    function getLayer(){
        let dist = getDistance();
        let bounds = _this.map.getBounds(),
            url = localhost + 'q_location?' + helper.paramString({
                layer: _this.countries[_this.country].location.qLayer,
                qid: _this.countries[_this.country].location.qID,
                label: _this.countries[_this.country].location.qLabel,
                west: bounds.getWest(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                north: bounds.getNorth(),
                dist: dist
            }),
            xhr = new XMLHttpRequest();
        
        xhr.onload = function(){
            if(this.status === 200){
                let data = JSON.parse(this.responseText),
                    places = {
                        "type": "FeatureCollection",
                        "features": []
                    };
                Object.keys(data).map(function(key){
                    places.features.push({
                        "type": "Feature",
                        "geometry": JSON.parse(data[key].geomj),
                        "properties": {
                            "infoj": data[key].infoj
                        }
                    });
                });
                
                breakdownClasses(places.features);
                
                if(_this.location.layer) _this.map.removeLayer(_this.location.layer);
                
                _this.location.layer = L.geoJson(places, {
                    pointToLayer: _ptl,
                    onEachFeature: _oef
                }).addTo(_this.map);
                
                function _ptl(point, latlng){
                    let count = point.properties.infoj.length;
                    
                    if(count > 1) {
                        let dot, vArr = getCompetitors(point.properties.infoj),
                            dotArr = [[400, _this.countries[_this.country].location.arrayCompColours[0]]];
                        
                        for (let i = 0; i < vArr.length - 1; i++) {
                            let vTot = 0;
                            for (let ii = i; ii < vArr.length - 1; ii++) {
                                vTot += parseInt(vArr[ii])
                            }
                            dotArr.push([400 * vTot / count, _this.countries[_this.country].location.arrayCompColours[i + 1]]);
                        }
                        dot = svg_builder(dotArr);
                        
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: dot,
                                iconSize: getIconSize(count)
                            })
                        });
                    } else {
                        let brand = point.properties.infoj[0].brand || 'other';
                        
                        return L.marker(latlng, {
                            icon: L.icon({
                                iconUrl: _this.countries[_this.country].location.arrayStyle[brand], 
                                iconSize: getIconSize(count)
                            })
                        });
                    }
                }
                
                function _oef(feature, layer){
                    
                    function layerOnClick(e){
                        let infoj = this.feature.properties.infoj,
                            count = this.feature.properties.infoj.length,
                            latlng = this.feature.geometry.coordinates.reverse();
                        
                        if(count > 1){
                            // Draw a cirle marker
                            _this.location.layerSelectionCell = L.circleMarker(latlng, {
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
                                _this.location.popup = L.popup()
                                    .setLatLng(latlng)
                                    .setContent('<div class="scrollbar_container"><div class="scrollbar"></div></div><div class="content location_table">' + table + '</div>')
                                    .openOn(_this.map);
                                require('./lscrolly')(document.querySelector('.leaflet-popup-content'));
                                
                                // Button to close popup.
                                _this.map.on('popupclose', function(){
                                    if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
                                });
                            }
                            
                            if (view_mode === 'mobile') {
                                // Remove the line marker which connects the cell with the drop down list;
                                if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);
                                        
                                // Populate and display the .location_drop with the location list table.
                                document.querySelector('.location_table').innerHTML = table;
                                document.querySelector('.map_button').style['display'] = 'none';
                                _this.location.location_drop.style['display'] = 'block';
                                        
                                // Pan map according to the location of the cluster cell;
                                let map_dom = document.getElementById('map'),
                                    map_dom__height = map_dom.clientHeight,
                                    map_dom__margin = parseInt(map_dom.style.marginTop),
                                    shiftY = parseInt((map_dom__height + map_dom__margin * 2) / 2) + parseInt(_this.location.location_drop.clientHeight) / 2 - (e.containerPoint.y + map_dom__margin);
                                
                                _this.map.setZoomAround(latLng, _this.map.getZoom() + 1, {animate: false});
                                _this.map.panBy([0, -shiftY]);
                                
                                // Draw line marker which connects hex cell with drop down.
                                _this.location.layerSelectionLine = L.marker(latLng, {
                                    icon: L.icon({
                                        iconUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%223%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Cline%20x1%3D%222%22%20y1%3D%220%22%20x2%3D%222%22%20y2%3D%221000%22%0A%20%20%20%20%20%20stroke-width%3D%221%22%20stroke%3D%22%23079e00%22/%3E%0A%3C/svg%3E',
                                        iconSize: [3, 1000],
                                        iconAnchor: [2, 1000]
                                    })
                                }).addTo(_this.map);
                                
                                // Button event to close the .location_drop.
                                document.querySelector('.location_drop__close').addEventListener('click', function(){
                                    if (_this.location.layerSelectionCell) _this.map.removeLayer(_this.location.layerSelectionCell);
                                    if (_this.location.layerSelectionLine) _this.map.removeLayer(_this.location.layerSelectionLine);
                                    
                                    _this.map.panBy([0, parseInt(_this.location.location_drop.clientHeight) / 2]);
                                    
                                    _this.location.location_drop.style['display'] = 'none';
                                    document.querySelector('.map_button').style['display'] = 'block';
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
                            shadowUrl: 'data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%3F%3E%0A%3Csvg%20width%3D%22866%22%20height%3D%221000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20style%3D%22fill%3A%23090%3Bfill-opacity%3A0.2%3B%22%20cx%3D%22433%22%20cy%3D%22500%22%20r%3D%22395%22%2F%3E%0A%3C%2Fsvg%3E',
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
        xhr.open("GET", url);
        xhr.send();
    }
    
    // Select a location layer.
    _this.location.selectLayer = selectLayer;
    
    function selectLayer(id){
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_location_info?' + helper.paramString({
            qid: _this.countries[_this.country].location.qID,
            id: id.toString().split('.')[1] || id,
            layer: _this.countries[_this.country].location.qLayer,
            vector: _this.countries[_this.country].location.qVector || null
        }));
        
        // Display the selected layer feature on load event.
        xhr.onload = function(){
            if(this.status === 200){
                let json = JSON.parse(this.responseText),
                    geomj = JSON.parse(json[0].geomj),
                    infoj = JSON.parse(json[0].infoj);
                
                // Remove layerSelection from map if exists.
                if (_this.location.layerSelection) _this.map.removeLayer(_this.location.layerSelection);
                
                // Create layerSelection from geoJSON and add to map.
                _this.location.layerSelection = L.geoJson({
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
                _this.locale.layersCheck('locationSelect', true);
                
                // Select the associated vector layer
                if (_this.vector.display && json[0].vector) _this.vector.selectLayer(json[0].vector);
                
                // Assign info fields to info table.
                let table = '';
                Object.keys(infoj).map(function (key) {
                    let info_field = key.substring(0,6) === 'empty_' ? '' : key;
                    if (infoj[key] !== null) table += '<tr><td>' + info_field + '</td><td>' + infoj[key] + '</td></tr>';
                });
                
                // Opacity is set to transition at 300ms for .location_info in _location.scss. Assign info table to location_info dom.
                _this.location.infoTable.style['opacity'] = 0;
                setTimeout(function(){
                    _this.location.infoTable.innerHTML = table;
                    _this.location.infoTable.style['opacity'] = 1;
                }, 300);
                _this.location.container.style['marginLeft'] = '-100%';
                
                // Add hook for the location
                _this.setHook('location_id', id);
                
                // Move info container up if display is mobile and info container is less than 200px in view.
                if (view_mode === 'mobile' && document.querySelector('html, body').scrollTop < 200){
                    document.querySelector('html, body').scrollTop = 200;
                }
            }
        }
        xhr.send();
        _this.locale.layersCheck('locationSelect', false);
    }
    
    // Tools for clustering
    
    // Get clustering distance
    function getDistance(){
        let zoom = _this.map.getZoom(),
            len = Object.keys(_this.countries[_this.country].location.clusterDistance).length,
            _min_cZoom = Object.keys(_this.countries[_this.country].location.clusterDistance)[0],
            _max_cZoom = Object.keys(_this.countries[_this.country].location.clusterDistance)[len-1];
        
        if(zoom < parseInt(_min_cZoom)) zoom = _min_cZoom;
        else if(zoom > parseInt(_max_cZoom)) zoom = _max_cZoom
        else zoom = zoom.toString();
        
        return _this.countries[_this.country].location.clusterDistance[zoom];
    }
    
    // Get classes for clustering
    function breakdownClasses(features){
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
    function getCompetitors(_arr){
        let v = [0, 0, 0], len = _arr.length, vals = [], 
            c = _this.countries[_this.country].location.competitors.length;
        
        for(let i = 0; i<len; i++){
            vals.push(_arr[i].brand);
        }
        
        for(let j = 0; j < c; j++){
            for(let k = 0; k < vals.length; k++){
                if(vals[k] === _this.countries[_this.country].location.competitors[j]){
                    v[j]++;
                }
            }
        }
        return v;
    }
    
}