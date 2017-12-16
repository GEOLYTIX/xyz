const L = require('leaflet');
const helper = require('./helper');

module.exports = function Drivetime(_this){

    // locale.drivetime is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.drivetime = function (change_country) {

        // Remove existing layer and layerMark.
        if (_this.drivetime.layer) _this.map.removeLayer(_this.drivetime.layer);
        if (_this.drivetime.layerMark) _this.map.removeLayer(_this.drivetime.layerMark);

        _this.drivetime.container.style['marginLeft'] = '0';
        _this.drivetime.infoTable.innerHTML = '';

        _this.drivetime.slider.value = 45;
        document.getElementById('drivetime_minutes').innerHTML = 45;
        _this.drivetime.slider.setAttribute('max', parseInt(_this.countries[_this.country].drivetime.maxMin));
        document.getElementById('btnDrivetimeCopy').style.display = 'none';

        // no support for drivetime hook now
        /*if (_this.hooks.drivetime){ 
            _this.drivetime.layer = L.geoJson(JSON.parse(decodeURI(_this.hooks.drivetime)),{
                interactive: false,
                style: _this.drivetime.style
            }).addTo(_this.map);
        }*/
        
        // Check if drivetime object exists
        if(drivetime){
            _this.drivetime.layer = L.geoJson(drivetime.geometry, {
                interactive: false,
                style: _this.drivetime.style
            }).addTo(_this.map);
            
            _this.drivetime.infoTable.innerHTML = helper.createStatsTable(drivetime.properties);
            _this.drivetime.infoTable.style['opacity'] = 1;
            
        }
    };
    _this.locale.drivetime();

    // Remove iso, clear info, remove hook and set container marginLeft to 0.
    document.getElementById('btnDrivetime--off').addEventListener('click', function(){
        if (_this.drivetime.layerMark) _this.map.removeLayer(_this.drivetime.layerMark);
        if (_this.drivetime.layer) _this.map.removeLayer(_this.drivetime.layer);
        if (_this.drivetime.layer_circlePoints) _this.map.removeLayer(_this.drivetime.layer_circlePoints);
        if (_this.drivetime.layer_samplePoints) _this.map.removeLayer(_this.drivetime.layer_samplePoints);
        if (_this.drivetime.layer_tin) _this.map.removeLayer(_this.drivetime.layer_tin);
        document.getElementById('btnDrivetimeCopy').style.display = 'none';

        // _this.removeHook('vector_id');
        // _this.locale.layersCheck('vectorSelect', null);

        // Reset module panel
        _this.drivetime.container.style['marginLeft'] = '0';
        _this.drivetime.infoTable.innerHTML = '';
    });

    document.getElementById('drivetime_slider_detail').addEventListener('input', function(){
        document.getElementById('drivetime_detail').innerHTML = this.value;
    });

    document.getElementById('drivetime_slider_reach').addEventListener('input', function(){
        document.getElementById('drivetime_reach').innerHTML = this.value;
    });

    document.getElementById('drivetime_slider').addEventListener('input', function(){
        document.getElementById('drivetime_minutes').innerHTML = this.value;
    });

    const btnDrivetime = document.getElementById('btnDrivetime');
    btnDrivetime.addEventListener('click', function(){
        document.getElementById('map').style.cursor = 'crosshair';

        _this.map.on('click', function(e){
            getDrivetime(e, document.getElementById('drivetime_slider').value * 60)
        });
    });

    // _this.drivetime_transit = false;
    // document.getElementById('chkDriveTimePublic').addEventListener('click', function () {
    //     _this.drivetime_transit = this.checked;
    // });

    function getDrivetime(e, _distance){
        _this.map.off('click');
        document.getElementById('map').style.cursor = '';

        document.querySelector('#drivetime_module .page_content').style.display = 'none';
        document.getElementById('btnDrivetime--off').style.display = 'none';
        document.querySelector('#drivetime_module .spinner').style.display = 'block';
        _this.drivetime.container.style['marginLeft'] = '-100%';

        // Add geometry to the gazetteer layer
        if (_this.drivetime.layerMark) _this.map.removeLayer(_this.drivetime.layerMark);
        _this.drivetime.layerMark = L.geoJson({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lng, e.latlng.lat]
            }
        }, {
            interactive: false,
            pointToLayer: function (feature, latlng) {
                return new L.Marker(latlng, {
                    icon: L.icon({
                        iconUrl: _this.drivetime.icon,
                        iconSize: [80, 40],
                        iconAnchor: [40, 40]
                    }),
                    interactive: false
                });
            },
            style: _this.gazetteer.style
        }).addTo(_this.map);

        // let mode = _this.drivetime_transit ? 'transit' : 'driving';

        let xhr = new XMLHttpRequest();

        // let boo = document.getElementById('selectProvider');
        // let provider = document.getElementById('selectProvider').options[document.getElementById('selectProvider').selectedIndex].value;

        xhr.open('GET', localhost +  'q_drivetime?' + helper.paramString({
            lng: e.latlng.lng,
            lat: e.latlng.lat,
            distance: _distance,
            detail: document.getElementById('drivetime_slider_detail').value,
            reach: document.getElementById('drivetime_slider_reach').value,
            mode: 'driving',
            provider: document.getElementById('selectProvider').options[document.getElementById('selectProvider').selectedIndex].value
            //infoj: encodeURIComponent(_this.countries[_this.country].drivetime.infoj),
            //arrayGrid: _this.countries[_this.country].drivetime.arrayGrid
        }));
        
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (this.status === 200) {
                
                if (_this.drivetime.layer) _this.map.removeLayer(_this.drivetime.layer);
                if (_this.drivetime.layer_circlePoints) _this.map.removeLayer(_this.drivetime.layer_circlePoints);
                if (_this.drivetime.layer_samplePoints) _this.map.removeLayer(_this.drivetime.layer_samplePoints);
                if (_this.drivetime.layer_tin) _this.map.removeLayer(_this.drivetime.layer_tin);
                let json = JSON.parse(this.responseText);

                _this.drivetime.layer_tin = L.geoJson(json.tin,{
                    interactive: false,
                    style: {
                        stroke: true,
                        color: "#999",
                        weight: 1,
                        fill: false
                      }
                }).addTo(_this.map);

                _this.drivetime.layer_circlePoints = L.geoJson(json.circlePoints,{
                    interactive: false,
                    pointToLayer: function (feature, latlng) {
                        return new L.CircleMarker(latlng, {
                            radius: 5,
                            color: "#555",
                            weight: 1,
                            fill: false
                        });
                    }
                }).addTo(_this.map);

                _this.drivetime.layer_samplePoints = L.geoJson(json.samplePoints,{
                    interactive: false,
                    pointToLayer: function (feature, latlng) {
                        return new L.CircleMarker(latlng, {
                            radius: 2,
                            color: "#333",
                            fillColor: "#333",
                            fill: true,
                            fillOpacity: 1
                        });
                    }
                }).addTo(_this.map);

                _this.drivetime.layer = L.geoJson(json.iso,{
                    interactive: false,
                    style: function(feature){

                        console.log(feature.properties.v);
                        console.log('0-' + parseInt(_distance * 0.33));
                        console.log(parseInt(_distance * 0.33) + '-' + parseInt(_distance * 0.66));
                        console.log(parseInt(_distance * 0.66) + '-' + parseInt(_distance));

                        let color = feature.properties.v === '0-' + parseInt(_distance * 0.33) ?
                            '#01ffee' : feature.properties.v === parseInt(_distance * 0.33) + '-' + parseInt(_distance * 0.66) ?
                                '#2200fe' : feature.properties.v === parseInt(_distance * 0.66) + '-' + parseInt(_distance) ?
                                    '#ff019e' : '#FFF';

                        return {
                            "stroke": true,
                            "color": color,
                            "weight": 2,
                            "fill": false
                        }
                    }
                }).addTo(_this.map);
                _this.map.fitBounds(_this.drivetime.layer.getBounds());

                document.querySelector('#drivetime_module .page_content').style.display = 'block';
                document.querySelector('#drivetime_module .spinner').style.display = 'none';
                document.getElementById('btnDrivetime--off').style.display = 'block';

                _this.drivetime.infoTable.style['opacity'] = 0;
                setTimeout(function () {
                    
                    _this.drivetime.infoTable.innerHTML = helper.createStatsTable(json.properties);
                    _this.drivetime.infoTable.style['opacity'] = 1;

                    document.getElementById('btnDrivetimeCopy').addEventListener('click', function () {
                        let textArea = document.createElement("textarea");
                        textArea.style.visibility = 'none';
                        textArea.value = JSON.stringify(json.iso);
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                    });
                    document.getElementById('btnDrivetimeCopy').style.display = 'block';
                }, 300);

                _this.drivetime.container.style['marginLeft'] = '-100%';
            }
        };
        xhr.send();
    }
};