import _xyz from '../../_xyz.mjs';

export default (layer, panel) => {

    let ctrl = _xyz.utils.createElement({
        tag: 'div',
        options: {
            className: 'section'
        },
        appendTo: panel
    });

    // Create transit mode dropdown.
    let mode = Object.keys(layer.catchments.modes)[0];
    _xyz.utils.dropdown({
        title: 'Transit mode:',
        appendTo: ctrl,
        entries: layer.catchments.modes,
        selected: mode,
        onchange: e => {
            mode = e.target.value;
            setParams();
        }
    });

    // spacer
    _xyz.utils.createElement({
        tag: 'br',
        appendTo: ctrl
    });

    _xyz.utils.createElement({
        tag: 'br',
        appendTo: ctrl
    });


    // Distance
    _xyz.utils.createElement({
        tag: 'span',
        options: {
            textContent: 'Maximum travel time: '
        },
        appendTo: ctrl
    });

    let lblMinutes = _xyz.utils.createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].defMin
        },
        appendTo: ctrl
    });

    _xyz.utils.createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: ' minutes'
        },
        appendTo: ctrl
    });

    let sliMinutes = _xyz.utils.createElement({
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
    _xyz.utils.createElement({
        tag: 'span',
        options: {
            textContent: 'Detail: '
        },
        appendTo: ctrl
    });

    let lblDetail = _xyz.utils.createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].detail
        },
        appendTo: ctrl
    });

    let sliDetail = _xyz.utils.createElement({
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
    _xyz.utils.createElement({
        tag: 'span',
        options: {
            textContent: 'Reach: '
        },
        appendTo: ctrl
    });

    let lblReach = _xyz.utils.createElement({
        tag: 'span',
        options: {
            classList: 'range_label',
            textContent: layer.catchments.modes[mode].reach
        },
        appendTo: ctrl
    });

    let sliReach = _xyz.utils.createElement({
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

    // Create api provider dropdown.
    let provider = layer.catchments.provider[0];
    _xyz.utils.dropdown({
        title: 'Provider:',
        appendTo: ctrl,
        entries: layer.catchments.provider,
        selected: provider,
        onchange: e => {
            provider = e.target.value;
        }
    });

    //TIN construction
    let chkCatchmentsConstruction = _xyz.utils.checkbox(
        e => { },
        {
            label: 'Display catchment sample points and TIN.',
            id: layer.layer + '_tin_construction'
        }
    );

    ctrl.appendChild(chkCatchmentsConstruction);

    let btnCatchment = _xyz.utils.createElement({
        tag: 'div',
        options: {
            classList: 'btn_wide cursor noselect',
            textContent: 'Set Catchment Location'
        },
        appendTo: ctrl,
        eventListener: {
            event: 'click',
            funct: () => {
                if (!btnCatchment.classList.contains('disabled')) {
                    btnCatchment.classList.add('disabled');
                    document.getElementById('Map').style.cursor = 'crosshair';
                    _xyz.map.on('click', e => {
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
                                pane: "tmp",
                                pointToLayer: function (feature, latlng) {
                                    return new L.Marker(latlng, {
                                        icon: L.icon({
                                            iconUrl: _xyz.utils.svg_symbols({
                                                type: "markerColor",
                                                style: {
                                                    colorMarker: "#444",
                                                    colorDot: "#888"
                                                }
                                            }),
                                            iconSize: [40, 40],
                                            iconAnchor: [20, 40]
                                        })
                                    });
                                }
                            }).addTo(_xyz.map);
                    
                        let xhr = new XMLHttpRequest();
                    
                        xhr.open('GET', _xyz.host + '/api/catchments?' + _xyz.utils.paramString({
                            locale: _xyz.locale,
                            layer: layer.layer,
                            lng: e.latlng.lng,
                            lat: e.latlng.lat,
                            distance: sliMinutes.value * 60,
                            detail: sliDetail.value,
                            reach: sliReach.value,
                            mode: mode,
                            provider: provider,
                            token: _xyz.token
                        }));
                    
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.onload = e => {

                            if (e.target.status === 502) {
                                btnCatchment.classList.remove('disabled');
                                layer.getLayer(layer);
                                return alert(e.target.response);
                            }
                    
                            if (e.target.status !== 200) {
                                console.log(e.target);
                                return;
                            }
                    
                            btnCatchment.classList.remove('disabled');
                    
                            layer.getLayer(layer);
                    
                            let json = JSON.parse(e.target.responseText);
                    
                            if (chkCatchmentsConstruction.control.checked) {
                                let layerTIN = L.geoJson(json.tin, {
                                    interactive: false,
                                    pane: 'tmp',
                                    style: {
                                        stroke: true,
                                        color: "#999",
                                        weight: 1,
                                        fill: false
                                    }
                                }).addTo(_xyz.map);
                    
                                let layerPoints = L.geoJson(json.circlePoints, {
                                    pointToLayer: function (feature, latlng) {
                                        return new L.CircleMarker(latlng, {
                                            radius: 5,
                                            color: "#555",
                                            weight: 1,
                                            fill: false,
                                            interactive: false,
                                            pane: 'tmp'
                                        });
                                    }
                                }).addTo(_xyz.map);
                    
                                let layerSample = L.geoJson(json.samplePoints, {
                                    pointToLayer: function (feature, latlng) {
                                        return new L.CircleMarker(latlng, {
                                            radius: 2,
                                            color: "#333",
                                            fillColor: "#333",
                                            fill: true,
                                            fillOpacity: 1,
                                            interactive: false,
                                            pane: 'tmp'
                                        });
                                    }
                                }).addTo(_xyz.map);
                            }
                        };
                        xhr.send();
                    });
                }
            }
        }
    });

    setParams();

    function setParams() {
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
}