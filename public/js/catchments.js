const utils = require('./utils');
const svg_symbols = require('./svg_symbols.js');

module.exports = function catchments(){
    let dom = {
        map: document.getElementById('map'),
        container: document.querySelector('#catchments_module > .swipe_container'),
        pages: document.querySelectorAll('#catchments_module .page_content'),
        btnQuery: document.querySelector('#catchments_module .btnQuery'),
        btnOff: document.querySelector('#catchments_module .btnOff'),
        btnCopy: document.querySelector('#catchments_module .btnCopy'),
        spinner: document.querySelector('#catchments_module .spinner'),
        info_table: document.querySelector('#catchments_module .infojTable'),
        lblMinutes: document.querySelector('#catchments_module .lblMinutes'),
        sliMinutes: document.querySelector('#catchments_module .sliMinutes'),
        lblReach: document.querySelector('#catchments_module .lblReach'),
        sliReach: document.querySelector('#catchments_module .sliReach'),
        lblDetail: document.querySelector('#catchments_module .lblDetail'),
        sliDetail: document.querySelector('#catchments_module .sliDetail'),
        selMode: document.querySelector('#catchments_module .selMode'),
        selProvider: document.querySelector('#catchments_module .selProvider'),
        chkCatchmentsConstruction: document.getElementById('chkCatchmentsConstruction')
    };

    // Create the catchments pane.
    _xyz.map.createPane(_xyz.catchments.pane[0]);
    _xyz.map.getPane(_xyz.catchments.pane[0]).style.zIndex = _xyz.catchments.pane[1];

    // locale.catchments is called upon initialisation and when the country is changed (change_country === true).
    _xyz.catchments.init = function (change_country) {
        removeLayer();
        resetModule();

        dom.selProvider.innerHTML = '';
        _xyz.catchments.provider.forEach(function(e){
            dom.selProvider.insertAdjacentHTML('beforeend','<option value="'+e+'">'+e.charAt(0).toUpperCase()+e.slice(1)+'</option>');
        });
        dom.selProvider.disabled = dom.selProvider.childElementCount === 1 ? true : false;

        dom.selMode.innerHTML = '';
        
        Object.keys(_xyz.countries[_xyz.country].catchments.modes).map(function(key){
            dom.selMode.insertAdjacentHTML('beforeend','<option value="'+key+'">'+key.charAt(0).toUpperCase()+key.slice(1)+'</option>');
        });
   
        setParams(dom.selMode.options[dom.selMode.selectedIndex].value);
    };
    _xyz.catchments.init();

    function removeLayer() {
        if (_xyz.catchments.layer) _xyz.map.removeLayer(_xyz.catchments.layer);
        if (_xyz.catchments.layerMark) _xyz.map.removeLayer(_xyz.catchments.layerMark);
        if (_xyz.catchments.layer_circlePoints) _xyz.map.removeLayer(_xyz.catchments.layer_circlePoints);
        if (_xyz.catchments.layer_samplePoints) _xyz.map.removeLayer(_xyz.catchments.layer_samplePoints);
        if (_xyz.catchments.layer_tin) _xyz.map.removeLayer(_xyz.catchments.layer_tin);
    }

    function resetModule() {
        dom.pages[1].style.display = 'none';
        dom.pages[0].style.display = 'block';
        dom.container.style.marginLeft = '0';
        dom.info_table.innerHTML = '';
    }

    function setParams(mode){
        dom.sliMinutes.min = _xyz.countries[_xyz.country].catchments.modes[mode].minMin;
        dom.sliMinutes.max = _xyz.countries[_xyz.country].catchments.modes[mode].maxMin;
        dom.sliMinutes.value = _xyz.countries[_xyz.country].catchments.modes[mode].defMin;
        dom.lblMinutes.innerHTML = dom.sliMinutes.value;
        dom.sliDetail.value = _xyz.countries[_xyz.country].catchments.modes[mode].detail;
        dom.lblDetail.innerHTML = dom.sliDetail.value;
        let reach = _xyz.countries[_xyz.country].catchments.modes[mode].reach;
        dom.sliReach.min = parseInt(reach * 0.5);
        dom.sliReach.max = parseInt(reach * 1.5);
        dom.sliReach.value = reach;
        dom.lblReach.innerHTML = reach;
        dom.selMode.disabled = dom.selMode.childElementCount === 1 ? true : false;
    }

    // Remove iso, clear info, remove hook and set container marginLeft to 0.
    dom.btnOff.addEventListener('click', function(){
        removeLayer();
        resetModule();
    });

    dom.sliDetail.addEventListener('input', function(){
        dom.lblDetail.innerHTML = this.value;
    });

    dom.sliReach.addEventListener('input', function(){
        dom.lblReach.innerHTML = this.value;
    });

    dom.sliMinutes.addEventListener('input', function(){
        dom.lblMinutes.innerHTML = this.value;
    });

    dom.selMode.addEventListener('change', function(e){
        setParams(e.target.value);
    });

    dom.btnQuery.addEventListener('click', function(){
        dom.map.style.cursor = 'crosshair';
        _xyz.map.on('click', function(e){
            getCatchments(e, dom.sliMinutes.value * 60)
        });
    });

    function getCatchments(e, _distance){
        _xyz.map.off('click');
        dom.map.style.cursor = '';
        dom.btnOff.style.display = 'none';
        dom.spinner.style.display = 'block';
        dom.pages[0].style.display = 'none';
        dom.container.style.marginLeft = '-50%';
        removeLayer();

        // Set layerMark on origin
        _xyz.catchments.layerMark = L.geoJson({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [e.latlng.lng, e.latlng.lat]
            }
        }, {
            interactive: false,
            pointToLayer: function (feature, latlng) {
                return new L.Marker(latlng, {
                    icon: L.icon({
                        iconUrl: svg_symbols.markerColor('#888', '#444'),
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })
                });
            }
        }).addTo(_xyz.map);

        let xhr = new XMLHttpRequest();

        xhr.open('GET', localhost +  'q_catchments?' + utils.paramString({
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

                if (dom.chkCatchmentsConstruction.checked) {
                    _xyz.catchments.layer_tin = L.geoJson(json.tin,{
                        interactive: false,
                        style: {
                            stroke: true,
                            color: "#999",
                            weight: 1,
                            fill: false
                          }
                    }).addTo(_xyz.map);
    
                    _xyz.catchments.layer_circlePoints = L.geoJson(json.circlePoints,{
                        interactive: false,
                        pointToLayer: function (feature, latlng) {
                            return new L.CircleMarker(latlng, {
                                radius: 5,
                                color: "#555",
                                weight: 1,
                                fill: false
                            });
                        }
                    }).addTo(_xyz.map);
    
                    _xyz.catchments.layer_samplePoints = L.geoJson(json.samplePoints,{
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
                    }).addTo(_xyz.map);
                }

                _xyz.catchments.layer = L.geoJson(json.iso, {
                    interactive: _xyz.countries[_xyz.country].catchments.infoj ? true : false,
                    pane: _xyz.catchments.pane[0],
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            click: function(e) {
                                feature.marker = [e.latlng.lng, e.latlng.lat];
                                statFromGeoJSON(feature);
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
                }).addTo(_xyz.map);

                function isoStyle(feature, _distance, fillOpacity){
                    let style = feature.properties.v == parseInt(_distance * 0.33) ?
                        ['#999',1] : feature.properties.v == parseInt(_distance * 0.66) ?
                            ['#666',1.5] : feature.properties.v == parseInt(_distance) ?
                               ['#333',2] : ['#333',2];

                    return {
                        'stroke': true,
                        'color': style[0],
                        'weight': style[1],
                        'fill': true,
                        'fillOpacity': fillOpacity
                    }
                }

                _xyz.map.fitBounds(_xyz.catchments.layer.getBounds());
                
                dom.spinner.style.display = 'none';
                dom.btnOff.style.display = 'block';
                dom.pages[1].style.display = 'block';

                dom.info_table.style['opacity'] = 0;
                setTimeout(function () {
                    
                    dom.info_table.innerHTML = utils.createStatsTable(json.properties);
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

    function statFromGeoJSON(feature) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_grid_info');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                feature.infoj = JSON.parse(this.response);
                _xyz.select.addLayerToRecord(feature);
            }
        }
        xhr.send(JSON.stringify({
            dbs: _xyz.countries[_xyz.country].catchments.dbs,
            table: _xyz.countries[_xyz.country].catchments.table,
            infoj: _xyz.countries[_xyz.country].catchments.infoj,
            geometry: feature.geometry
        }));
    }
};