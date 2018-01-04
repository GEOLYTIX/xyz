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
        // if (_this.hooks.drivetime){ 
        //     _this.drivetime.layer = L.geoJson(JSON.parse(decodeURI(_this.hooks.drivetime)),{
        //         interactive: false,
        //         style: _this.drivetime.style
        //     }).addTo(_this.map);
        // }
        
        // Check if drivetime object exists
        // if(drivetime){
        //     _this.drivetime.layer = L.geoJson(drivetime.geometry, {
        //         interactive: false,
        //         style: _this.drivetime.style
        //     }).addTo(_this.map);
        //     _this.drivetime.infoTable.innerHTML = helper.createStatsTable(drivetime.properties);
        //     _this.drivetime.infoTable.style['opacity'] = 1;
        // }
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

    document.getElementById('selectMode').addEventListener('change', function(e){
        _this.drivetime.slider.min = e.target.value === 'walking'? 5 : 15;
        _this.drivetime.slider.max = e.target.value === 'walking'? 45 : 180;
        _this.drivetime.slider.value = e.target.value === 'walking'? 15 : 45;
        document.getElementById('drivetime_minutes').innerHTML = e.target.value === 'walking'? 15 : 45;
        document.getElementById('drivetime_slider_reach').min = e.target.value === 'walking'? 500 : 25;
        document.getElementById('drivetime_slider_reach').max = e.target.value === 'walking'? 750 : 35;
        document.getElementById('drivetime_slider_reach').value = e.target.value === 'walking'? 600 : 30;
        document.getElementById('drivetime_reach').innerHTML = e.target.value === 'walking'? 600 : 30;
    });

    const btnDrivetime = document.getElementById('btnDrivetime');
    btnDrivetime.addEventListener('click', function(){
        document.getElementById('map').style.cursor = 'crosshair';

        _this.map.on('click', function(e){
            getDrivetime(e, document.getElementById('drivetime_slider').value * 60)
        });
    });

    _this.drivetime.construction = false;
    document.getElementById('chkDrivetimeConstruction').addEventListener('click', function () {
        _this.drivetime.construction = this.checked;
    });

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

        let xhr = new XMLHttpRequest();

        xhr.open('GET', localhost +  'q_drivetime?' + helper.paramString({
            lng: e.latlng.lng,
            lat: e.latlng.lat,
            distance: _distance,
            detail: document.getElementById('drivetime_slider_detail').value,
            reach: document.getElementById('drivetime_slider_reach').value,
            mode: document.getElementById('selectMode').options[document.getElementById('selectMode').selectedIndex].value,
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

                if (_this.drivetime.construction) {
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
                }

                _this.drivetime.layer = L.geoJson(json.iso, {
                    interactive: true,
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            click: function () {
                                console.log(feature.properties);
                                let xhr = new XMLHttpRequest();
                                xhr.open('POST', 'q_grid_info');
                                xhr.setRequestHeader("Content-Type","application/json");
                                xhr.onload = function(){
                                    if(this.status === 200) console.log(this.response);
                                }
                                xhr.send(JSON.stringify({
                                    infoj: "json_build_object('Age & Gender', json_build_object('Total Population', sum(pop__11)::integer,'Gender', json_build_object ('Female', sum(gen_female__11)::integer,'Male', sum(gen_male__11)::integer),'Age 16-74', sum(age_16to74__11)::integer),'Ethinicity', json_build_object('White British', sum(ret_white_brit__11)::integer),'Unemployment', json_build_object('Unemployed 2005', sum(ue__05)::integer,'Unemployed 2006', sum(ue__06)::integer,'Unemployed 2007', sum(ue__07)::integer,'Unemployed 2008', sum(ue__08)::integer,'Unemployed 2009', sum(ue__09)::integer,'Unemployed 2010', sum(ue__10)::integer,'Unemployed 2011', sum(ue__11)::integer,'Unemployed 2012', sum(ue__12)::integer,'Unemployed 2013', sum(ue__13)::integer,'Unemployed 2014', sum(ue__14)::integer,'Unemployed 2015', sum(ue__15)::integer,'Unemployed 2016', sum(ue__16)::integer))",
                                    geometry: feature.geometry
                                }));
                            },
                            mouseover: function () {
                                this.setStyle(isoStyle(feature, _distance, 0.2));
                            },
                            mouseout: function () {
                                this.setStyle(isoStyle(feature, _distance, 0));
                            }
                        });
                    },
                    style: function (feature) {
                        return isoStyle(feature, _distance, 0)
                    }
                }).addTo(_this.map);

                function isoStyle(feature, _distance, fillOpacity){
                        let color = feature.properties.v === '0-' + parseInt(_distance * 0.33) ?
                            '#01ffee' : feature.properties.v === parseInt(_distance * 0.33) + '-' + parseInt(_distance * 0.66) ?
                                '#2200fe' : feature.properties.v === parseInt(_distance * 0.66) + '-' + parseInt(_distance) ?
                                    '#ff019e' : '#FFF';

                        return {
                            'stroke': true,
                            'color': color,
                            'weight': 2,
                            'fill': true,
                            'fillOpacity': fillOpacity
                        }
                }

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