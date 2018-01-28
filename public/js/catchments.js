const L = require('leaflet');
const helper = require('./helper');
const svg_symbols = require('./svg_symbols.js');

module.exports = function catchments(_){
    let dom = {};
    dom.map = document.getElementById('map');
    dom.container = document.querySelector('#catchments_module > .swipe_container');
    dom.pages = document.querySelectorAll('#catchments_module .page_content');
    dom.btnQuery = document.querySelector('#catchments_module .btnQuery');
    dom.btnOff = document.querySelector('#catchments_module .btnOff');
    dom.btnCopy = document.querySelector('#catchments_module .btnCopy');
    dom.spinner = document.querySelector('#catchments_module .spinner');
    dom.info_table = document.querySelector('#catchments_module .info_table');
    dom.lblMinutes = document.querySelector('#catchments_module .lblMinutes');
    dom.sliMinutes = document.querySelector('#catchments_module .sliMinutes');
    dom.lblReach = document.querySelector('#catchments_module .lblReach');
    dom.sliReach = document.querySelector('#catchments_module .sliReach');
    dom.lblDetail = document.querySelector('#catchments_module .lblDetail');
    dom.sliDetail = document.querySelector('#catchments_module .sliDetail');
    dom.selMode = document.querySelector('#catchments_module .selMode');
    dom.selProvider = document.querySelector('#catchments_module .selProvider');
    dom.chkCatchmentsConstruction = document.getElementById('chkCatchmentsConstruction');

    // locale.catchments is called upon initialisation and when the country is changed (change_country === true).
    _.locale.catchments = function (change_country) {
        removeLayer();
        resetModule();

        dom.selProvider.innerHTML = '';
        _.catchments.provider.forEach(function(e){
            dom.selProvider.insertAdjacentHTML('beforeend','<option value="'+e+'">'+e.charAt(0).toUpperCase()+e.slice(1)+'</option>');
        });
        dom.selProvider.disabled = dom.selProvider.childElementCount === 1 ? true : false;

        dom.selMode.innerHTML = '';
        Object.keys(_.countries[_.country].catchments).map(function(key){
            dom.selMode.insertAdjacentHTML('beforeend','<option value="'+key+'">'+key.charAt(0).toUpperCase()+key.slice(1)+'</option>');
        });
   
        setParams(dom.selMode.options[dom.selMode.selectedIndex].value);
    };
    _.locale.catchments();

    function removeLayer() {
        if (_.catchments.layer) _.map.removeLayer(_.catchments.layer);
        if (_.catchments.layerMark) _.map.removeLayer(_.catchments.layerMark);
        if (_.catchments.layer_circlePoints) _.map.removeLayer(_.catchments.layer_circlePoints);
        if (_.catchments.layer_samplePoints) _.map.removeLayer(_.catchments.layer_samplePoints);
        if (_.catchments.layer_tin) _.map.removeLayer(_.catchments.layer_tin);
    }

    function resetModule() {
        dom.pages[1].style.display = 'none';
        dom.pages[0].style.display = 'block';
        dom.container.style.marginLeft = '0';
        dom.info_table.innerHTML = '';
    }

    function setParams(mode){
        dom.sliMinutes.min = _.countries[_.country].catchments[mode].minMin;
        dom.sliMinutes.max = _.countries[_.country].catchments[mode].maxMin;
        dom.sliMinutes.value = _.countries[_.country].catchments[mode].defMin;
        dom.lblMinutes.innerHTML = dom.sliMinutes.value;
        dom.sliDetail.value = _.countries[_.country].catchments[mode].detail;
        dom.lblDetail.innerHTML = dom.sliDetail.value;
        let reach = _.countries[_.country].catchments[mode].reach;
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
        _.map.on('click', function(e){
            getcatchments(e, dom.sliMinutes.value * 60)
        });
    });

    function getcatchments(e, _distance){
        _.map.off('click');
        dom.map.style.cursor = '';
        dom.btnOff.style.display = 'none';
        dom.spinner.style.display = 'block';
        dom.pages[0].style.display = 'none';
        dom.container.style.marginLeft = '-50%';
        removeLayer();

        // Set layerMark on origin
        _.catchments.layerMark = L.geoJson({
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
        }).addTo(_.map);

        let xhr = new XMLHttpRequest();

        xhr.open('GET', localhost +  'q_catchments?' + helper.paramString({
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
                    _.catchments.layer_tin = L.geoJson(json.tin,{
                        interactive: false,
                        style: {
                            stroke: true,
                            color: "#999",
                            weight: 1,
                            fill: false
                          }
                    }).addTo(_.map);
    
                    _.catchments.layer_circlePoints = L.geoJson(json.circlePoints,{
                        interactive: false,
                        pointToLayer: function (feature, latlng) {
                            return new L.CircleMarker(latlng, {
                                radius: 5,
                                color: "#555",
                                weight: 1,
                                fill: false
                            });
                        }
                    }).addTo(_.map);
    
                    _.catchments.layer_samplePoints = L.geoJson(json.samplePoints,{
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
                    }).addTo(_.map);
                }

                _.catchments.layer = L.geoJson(json.iso, {
                    interactive: _.countries[_.country].grid.infoj ? true : false,
                    pane: 'shadowFilter',
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            click: function(e) {
                                feature.marker = [e.latlng.lng, e.latlng.lat];
                                _.grid.statFromGeoJSON(feature);
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
                }).addTo(_.map);

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

                _.map.fitBounds(_.catchments.layer.getBounds());
                
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