const utils = require('./utils');
const svg_symbols = require('./svg_symbols.js');

function catchmentControl(layer) {

    let ctrl = utils.createElement('div', {
        className: 'section report-block'
    });


    // Mode
    utils._createElement({
        tag: 'div',
        options: {
            textContent: 'Transit mode:'
        },
        appendTo: ctrl
    });

    let mode,
        selMode = utils._createElement({
            tag: 'select',
            appendTo: ctrl,
            eventListener: {
                event: 'change',
                funct: e => {
                    mode = e.target.value;
                    setParams();
                }
            }
        });

    Object.keys(layer.catchments.modes).forEach(function (key) {
        selMode.insertAdjacentHTML('beforeend', '<option value="' + key + '">' + key.charAt(0).toUpperCase() + key.slice(1) + '</option>');
    });

    //selMode.disabled = selMode.childElementCount === 1 ? true : false;

    mode = selMode.options[selMode.selectedIndex].value;


    utils._createElement({
        tag: 'br',
        appendTo: ctrl
    });

    utils._createElement({
        tag: 'br',
        appendTo: ctrl
    });


    // Distance
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Maximum travel time: '
        },
        appendTo: ctrl
    });

    let lblMinutes = utils._createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].defMin
        },
        appendTo: ctrl
    });

    utils._createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: ' minutes'
        },
        appendTo: ctrl
    });

    let sliMinutes = utils._createElement({
        tag: 'input',
        options: {
            classList: 'range_new',
            type: 'range'
        },
        eventListener: {
            event: 'input',
            funct: e => lblMinutes.textContent = e.target.value
        },
        appendTo: ctrl
    });


    // Detail
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Detail: '
        },
        appendTo: ctrl
    });

    let lblDetail = utils._createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].detail
        },
        appendTo: ctrl
    });

    let sliDetail = utils._createElement({
        tag: 'input',
        options: {
            classList: 'range_new',
            type: 'range',
            min: '1',
            max: '5'
        },
        eventListener: {
            event: 'input',
            funct: e => lblDetail.textContent = e.target.value
        },
        appendTo: ctrl
    });


    // Reach
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Reach: '
        },
        appendTo: ctrl
    });

    let lblReach = utils._createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].reach
        },
        appendTo: ctrl
    });

    let sliReach = utils._createElement({
        tag: 'input',
        options: {
            classList: 'range_new',
            type: 'range'
        },
        eventListener: {
            event: 'input',
            funct: e => lblReach.textContent = e.target.value
        },
        appendTo: ctrl
    });


    // Provider
    let provider;
    utils._createElement({
        tag: 'div',
        options: {
            textContent: 'Provider:'
        },
        appendTo: ctrl
    });

    let selProvider = utils._createElement({
        tag: 'select',
        appendTo: ctrl,
        eventListener: {
            event: 'change',
            funct: e => provider = e.target.value
        }
    });

    layer.catchments.provider.forEach(function (key) {
        selProvider.insertAdjacentHTML('beforeend', '<option value="' + key + '">' + key.charAt(0).toUpperCase() + key.slice(1) + '</option>');
    });

    //selProvider.disabled = selProvider.childElementCount === 1 ? true : false;


    // TIN construction
    // let logScale = utils.checkbox(function (e) {
    //     layer.markerLog = e.target.checked;
    //     layer.style.markerLog = layer.markerLog;
    //     layer.getLayer();
    // }, { label: 'Display catchment sample points and TIN.', id: layer.layer + '_tin_construction' });

    // ctrl.appendChild(logScale);

    let btnCatchment = utils._createElement({
        tag: 'div',
        options: {
            classList: 'btn_wide cursor noselect',
            textContent: 'Set Catchment Location'
        },
        appendTo: ctrl,
        eventListener: {
            event: 'click',
            funct: e => {
                if (!utils.hasClass(btnCatchment,'disabled')) {
                    utils.addClass(btnCatchment,'disabled')
                    document.getElementById('Map').style.cursor = 'crosshair';
                    _xyz.map.on('click', (e) => getCatchments(e));
                }
            }
        }
    });

    setParams();
    function setParams(){
        sliMinutes.min = layer.catchments.modes[mode].minMin;
        sliMinutes.max = layer.catchments.modes[mode].maxMin;
        sliMinutes.value = layer.catchments.modes[mode].defMin;
        lblMinutes.innerHTML = sliMinutes.value;
        sliDetail.value = layer.catchments.modes[mode].detail;
        lblDetail.innerHTML = sliDetail.value;
        let reach = layer.catchments.modes[mode].reach;
        sliReach.min = parseInt(reach * 0.5);
        sliReach.max = parseInt(reach * 1.5);
        sliReach.value = reach;
        lblReach.innerHTML = reach;
    }

    function getCatchments(e, distance){
        layer.loader.style.display = 'block';
        _xyz.map.off('click');
        document.getElementById('Map').style.cursor = '';

        // Set layerMark on origin
        let layerMark = L.geoJson({
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

        xhr.open('GET', host +  'q_catchments?' + utils.paramString({
            lng: e.latlng.lng,
            lat: e.latlng.lat,
            distance: sliMinutes.value * 60,
            detail: sliDetail.value,
            reach: sliReach.value,
            mode: selMode.options[selMode.selectedIndex].value,
            provider: selProvider.options[selProvider.selectedIndex].value,
            dbs: layer.dbs,
            table_target: layer.table
        }));
        
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if (xhr.status === 200) {

                utils.removeClass(btnCatchment,'disabled');

                layer.getLayer();
                
                //let json = JSON.parse(this.responseText);

                // if (dom.chkCatchmentsConstruction.checked) {
                //     _xyz.catchments.layer_tin = L.geoJson(json.tin,{
                //         interactive: false,
                //         pane: _xyz.catchments.pane[0],
                //         style: {
                //             stroke: true,
                //             color: "#999",
                //             weight: 1,
                //             fill: false
                //           }
                //     }).addTo(_xyz.map);
    
                //     _xyz.catchments.layer_circlePoints = L.geoJson(json.circlePoints,{
                //         pointToLayer: function (feature, latlng) {
                //             return new L.CircleMarker(latlng, {
                //                 radius: 5,
                //                 color: "#555",
                //                 weight: 1,
                //                 fill: false,
                //                 interactive: false,
                //                 pane: _xyz.catchments.pane[0]
                //             });
                //         }
                //     }).addTo(_xyz.map);
    
                //     _xyz.catchments.layer_samplePoints = L.geoJson(json.samplePoints,{
                //         pointToLayer: function (feature, latlng) {
                //             return new L.CircleMarker(latlng, {
                //                 radius: 2,
                //                 color: "#333",
                //                 fillColor: "#333",
                //                 fill: true,
                //                 fillOpacity: 1,
                //                 interactive: false,
                //                 pane: _xyz.catchments.pane[0]
                //             });
                //         }
                //     }).addTo(_xyz.map);
                // }

                //let tmp = L.geoJson(json.iso, {
                    //interactive: _xyz.select && _xyz.locales[_xyz.locale].catchments.infoj ? true : false,
                    //pane: _xyz.catchments.pane[0],
                    // onEachFeature: function (feature, layer) {
                    //     layer.on({
                    //         click: function(e) {
                    //             feature.marker = [e.latlng.lng, e.latlng.lat];
                    //             statFromGeoJSON(feature);
                    //             this.setStyle(isoStyle(feature, _distance, 0));
                    //         },
                    //         mouseover: function () {
                    //             this.setStyle(isoStyle(feature, _distance, 0.1));
                    //         },
                    //         mouseout: function () {
                    //             this.setStyle(isoStyle(feature, _distance, 0));
                    //         }
                    //     });
                    // },
                    // style: function (feature) {
                    //     return isoStyle(feature, _distance, 0)
                    // }
                //}).addTo(_xyz.map);

                // function isoStyle(feature, _distance, fillOpacity){
                //     let style = feature.properties.v == parseInt(_distance * 0.33) ?
                //         ['#999',1] : feature.properties.v == parseInt(_distance * 0.66) ?
                //             ['#666',1.5] : feature.properties.v == parseInt(_distance) ?
                //                ['#333',2] : ['#333',2];

                //     return {
                //         'stroke': true,
                //         'color': style[0],
                //         'weight': style[1],
                //         'fill': true,
                //         'fillOpacity': fillOpacity
                //     }
                // }

                //_xyz.map.fitBounds(tmp.getBounds());
            }
        };
        xhr.send();
    }

    return ctrl;
}

module.exports = {
    catchmentControl: catchmentControl
}