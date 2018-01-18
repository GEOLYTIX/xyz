const L = require('leaflet');
const helper = require('./helper');
const svg_marker = require('./svg_marker.js');

module.exports = function Drivetime(_this){
    let dom = {};
    dom.map = document.getElementById('map');
    dom.container = document.querySelector('#drivetime_module > .swipe_container');
    dom.pages = document.querySelectorAll('#drivetime_module .page_content');
    dom.btnQuery = document.querySelector('#drivetime_module .btnQuery');
    dom.btnOff = document.querySelector('#drivetime_module .btnOff');
    dom.btnCopy = document.querySelector('#drivetime_module .btnCopy');
    dom.spinner = document.querySelector('#drivetime_module .spinner');
    dom.info_table = document.querySelector('#drivetime_module .info_table');
    dom.minutes = document.querySelector('#drivetime_module .minutes');
    dom.sliMinutes = document.querySelector('#drivetime_module .sliMinutes');
    dom.reach = document.querySelector('#drivetime_module .reach');
    dom.sliReach = document.querySelector('#drivetime_module .sliReach');
    dom.detail = document.querySelector('#drivetime_module .detail');
    dom.sliDetail = document.querySelector('#drivetime_module .sliDetail');
    dom.selMode = document.querySelector('#drivetime_module .selMode');
    dom.selProvider = document.querySelector('#drivetime_module .selProvider');
    dom.chkDrivetimeConstruction = document.getElementById('chkDrivetimeConstruction');

    // locale.drivetime is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.drivetime = function (change_country) {
        removeLayer();
        resetModule();

        dom.selProvider.innerHTML = '';
        _this.drivetime.provider.forEach(function(e){
            dom.selProvider.insertAdjacentHTML('beforeend','<option value="'+e+'">'+e.charAt(0).toUpperCase()+e.slice(1)+'</option>');
        });
        dom.selProvider.disabled = dom.selProvider.childElementCount === 1 ? true : false;

        dom.selMode.innerHTML = '';
        Object.keys(_this.countries[_this.country].drivetime).map(function(key){
            dom.selMode.insertAdjacentHTML('beforeend','<option value="'+key+'">'+key.charAt(0).toUpperCase()+key.slice(1)+'</option>');
        });
   
        setParams(dom.selMode.options[dom.selMode.selectedIndex].value);
    };
    _this.locale.drivetime();

    function removeLayer() {
        if (_this.drivetime.layer) _this.map.removeLayer(_this.drivetime.layer);
        if (_this.drivetime.layerMark) _this.map.removeLayer(_this.drivetime.layerMark);
        if (_this.drivetime.layer_circlePoints) _this.map.removeLayer(_this.drivetime.layer_circlePoints);
        if (_this.drivetime.layer_samplePoints) _this.map.removeLayer(_this.drivetime.layer_samplePoints);
        if (_this.drivetime.layer_tin) _this.map.removeLayer(_this.drivetime.layer_tin);
    }

    function resetModule() {
        dom.pages[1].style.display = 'none';
        dom.pages[0].style.display = 'block';
        dom.container.style['marginLeft'] = '0';
        dom.info_table.innerHTML = '';
    }

    function setParams(mode){
        dom.sliMinutes.min = _this.countries[_this.country].drivetime[mode].minMin;
        dom.sliMinutes.max = _this.countries[_this.country].drivetime[mode].maxMin;
        dom.sliMinutes.value = _this.countries[_this.country].drivetime[mode].defMin;
        dom.minutes.innerHTML = dom.sliMinutes.value;
        dom.sliDetail.value = _this.countries[_this.country].drivetime[mode].detail;
        dom.detail.innerHTML = dom.sliDetail.value;
        let reach = _this.countries[_this.country].drivetime[mode].reach;
        dom.sliReach.min = parseInt(reach * 0.5);
        dom.sliReach.max = parseInt(reach * 1.5);
        dom.sliReach.value = reach;
        dom.reach.innerHTML = reach;
        dom.selMode.disabled = dom.selMode.childElementCount === 1 ? true : false;
    }

    // Remove iso, clear info, remove hook and set container marginLeft to 0.
    dom.btnOff.addEventListener('click', function(){
        removeLayer();
        resetModule();
    });

    dom.sliDetail.addEventListener('input', function(){
        dom.detail.innerHTML = this.value;
    });

    dom.sliReach.addEventListener('input', function(){
        dom.reach.innerHTML = this.value;
    });

    dom.sliMinutes.addEventListener('input', function(){
        dom.minutes.innerHTML = this.value;
    });

    dom.selMode.addEventListener('change', function(e){
        setParams(e.target.value);
    });

    dom.btnQuery.addEventListener('click', function(){
        dom.map.style.cursor = 'crosshair';
        _this.map.on('click', function(e){
            getDrivetime(e, dom.sliMinutes.value * 60)
        });
    });

    function getDrivetime(e, _distance){
        _this.map.off('click');
        dom.map.style.cursor = '';
        dom.btnOff.style.display = 'none';
        dom.spinner.style.display = 'block';
        dom.pages[0].style.display = 'none';
        dom.container.style['marginLeft'] = '-50%';
        removeLayer();

        // Set layerMark on origin
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
                        iconUrl: svg_marker('', '#777'),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    }),
                    interactive: false
                });
            }
        }).addTo(_this.map);

        let xhr = new XMLHttpRequest();

        xhr.open('GET', localhost +  'q_drivetime?' + helper.paramString({
            lng: e.latlng.lng,
            lat: e.latlng.lat,
            distance: _distance,
            detail: dom.sliDetail.value,
            reach: dom.sliReach.value,
            mode: dom.selMode.options[dom.selMode.selectedIndex].value,
            provider: dom.selProvider.options[dom.selProvider.selectedIndex].value
        }));
        
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (this.status === 200) {
                
                let json = JSON.parse(this.responseText);

                if (dom.chkDrivetimeConstruction.checked) {
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
                    interactive: _this.countries[_this.country].grid.infoj ? true : false,
                    pane: 'shadowFilter',
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            click: function(e) {
                                feature.marker = [e.latlng.lng, e.latlng.lat];
                                _this.grid.fromGeoJSON(feature);
                                this.setStyle(isoStyle(feature, _distance, 0));
                            },
                            mouseover: function () {
                                this.setStyle(isoStyle(feature, _distance, 0.1));
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
                    let style = feature.properties.v === '0-' + parseInt(_distance * 0.33) ?
                        ['#999',1] : feature.properties.v === parseInt(_distance * 0.33) + '-' + parseInt(_distance * 0.66) ?
                            ['#666',1.5] : feature.properties.v === parseInt(_distance * 0.66) + '-' + parseInt(_distance) ?
                               ['#333',2] : ['#333',2];

                    return {
                        'stroke': true,
                        'color': style[0],
                        'weight': style[1],
                        'fill': true,
                        'fillOpacity': fillOpacity
                    }
                }

                _this.map.fitBounds(_this.drivetime.layer.getBounds());
                
                dom.spinner.style.display = 'none';
                dom.btnOff.style.display = 'block';
                dom.pages[1].style.display = 'block';

                dom.info_table.style['opacity'] = 0;
                setTimeout(function () {
                    
                    dom.info_table.innerHTML = helper.createStatsTable(json.properties);
                    dom.info_table.style['opacity'] = 1;

                    dom.btnCopy.addEventListener('click', function () {
                        let textArea = document.createElement("textarea");
                        textArea.style.visibility = 'none';
                        textArea.value = JSON.stringify(json.iso);
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();
                    });
                }, 300);
            }
        };
        xhr.send();
    }
};