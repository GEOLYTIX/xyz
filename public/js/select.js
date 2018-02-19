const utils = require('./utils');
const svg_symbols = require('./svg_symbols');
const controls = require('./select_controls');
const select_table = require('./select_table');

module.exports = function Select() {

    // Set dom elements for the select module.
    let dom = {
        header: document.querySelector('#select_module .header'),
        btnOff: document.querySelector('#select_module .btnOff'),
        layers: document.querySelector('#select_module .layers')
    };

    // Create select pane. This pane has a shadow filter associated in the css.
    _xyz.map.createPane('select');
    _xyz.map.getPane('select').style.zIndex = 600;
    _xyz.map.createPane('select_marker');
    _xyz.map.getPane('select_marker').style.zIndex = 601;
    _xyz.map.createPane('select_circle');
    _xyz.map.getPane('select_circle').style.zIndex = 602;
    // let sheet = document.styleSheets[1];
    // sheet.insertRule(".page_content { background-color: red; }", 1);

    // init() is called upon initialisation and when the country is changed (change_country === true).
    _xyz.select.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) _xyz.select.resetModule();

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.select) _xyz.hooks.select.map(function (hook) {
            let selectionHook = hook.split('!');
            selectLayerFromEndpoint({
                layer: selectionHook[1],
                table: selectionHook[2],
                id: selectionHook[3],
                marker: [selectionHook[4].split(';')[0], selectionHook[4].split(';')[1]]
            });
        });
        _xyz.removeHook('select');
    }
    _xyz.select.init();

    // Reset the module on btnOff click.
    dom.btnOff.addEventListener('click', function () {
        _xyz.select.resetModule();
    });

    // Reset function for the module container.
    _xyz.select.resetModule = resetModule;
    function resetModule() {
        dom.btnOff.style.display = 'none';
        dom.header.style.background = '#eee';
        dom.layers.innerHTML = '';
        _xyz.removeHook('select');
        _xyz.select.records.map(function (record) {
            if (record.layer && record.layer.L) _xyz.map.removeLayer(record.layer.L);
            if (record.layer && record.layer.M) _xyz.map.removeLayer(record.layer.M);
            if (record.layer && record.layer.D) _xyz.map.removeLayer(record.layer.D);
            record.layer = null;
        });
        
        // Make select tab active on mobile device.
        if (_xyz.activateLayersTab) _xyz.activateLayersTab();
    }

    // Get layer from data source
    function selectLayerFromEndpoint(layer) {
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });
        if (freeRecords.length === 0) return

        // Make select tab active on mobile device.
        if (_xyz.activateSelectTab) _xyz.activateSelectTab();

        let _layer = _xyz.countries[_xyz.country].layers[layer.layer];

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_select');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function () {
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                layer.geometry = JSON.parse(json.geomj);
                layer.infoj = json.infoj;
                layer.editable = _layer.editable;
                layer.displayGeom = _layer.displayGeom ? JSON.parse(json[0].displaygeom) : null;
                layer.dbs = _layer.dbs;
                layer.qID = _layer.qID;
                addLayerToRecord(layer);
            }
        }
        xhr.send(JSON.stringify({
            dbs: _layer.dbs,
            table: layer.table,
            qID: _layer.qID,
            id: layer.id,
            infoj: _layer.infoj,
            geomj: _layer.geomj,
            displayGeom: _layer.displayGeom || ''
        }));
    }
    _xyz.select.selectLayerFromEndpoint = selectLayerFromEndpoint;

    function addLayerToRecord(layer) {
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        // Set marker coordinates from point geometry.
        if (layer.geometry.type === 'Point') layer.marker = layer.geometry.coordinates;

        dom.btnOff.style.display = 'block';
        dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - (((freeRecords.length - 1) / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

        if (freeRecords.length > 0) {
            freeRecords[0].layer = layer;
            if (layer.layer) {
                _xyz.pushHook('select',
                    freeRecords[0].letter + '!' +
                    freeRecords[0].layer.layer + '!' +
                    freeRecords[0].layer.table + '!' +
                    freeRecords[0].layer.id + '!' +
                    freeRecords[0].layer.marker[0] + ';' +
                    freeRecords[0].layer.marker[1]);
            }

            addRecordToMap(freeRecords[0])
        }
        if (freeRecords.length === 1) dom.header.style.background = '#ffcc80';
    }
    _xyz.select.addLayerToRecord = addLayerToRecord;

    function addRecordToMap(record) {
        if (record.layer.displayGeom) {
            record.layer.D = L.geoJson(
                {
                    type: 'Feature',
                    geometry: record.layer.displayGeom
                }, {
                    interactive: false,
                    pane: 'select',
                    style: {
                        stroke: false,
                        color: record.color,
                        weight: 2,
                        fill: true,
                        fillOpacity: 0.3
                    }
                }).addTo(_xyz.map);
        }

        if (record.layer.marker) {
            record.layer.M = L.geoJson(
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: record.layer.marker
                    }
                }, {
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: L.icon({
                                iconUrl: svg_symbols.markerLetter(record.color, record.letter),
                                iconSize: [40, 40],
                                iconAnchor: [20, 40]
                            }),
                            interactive: false,
                            pane: 'select_marker'
                        });
                    }
                }).addTo(_xyz.map);
        }

        record.layer.L = L.geoJson(
            {
                type: 'Feature',
                geometry: record.layer.geometry
            }, {
                interactive: false,
                pane: 'select',
                style: {
                    stroke: true,
                    color: record.color,
                    fill: true,
                    fillOpacity: 0
                },
                pointToLayer: function (feature, latlng) {
                    return L.marker(
                        latlng,
                        {
                            icon: L.icon({
                                iconSize: 35,
                                iconUrl: svg_symbols.circle(record.color)
                            }),
                            pane: 'select_circle',
                            interactive: true,
                            draggable: record.layer.editable
                        });
                }
            }).addTo(_xyz.map);

        addRecordToList(record);
    }

    function addRecordToList(record) {

        // Create drawer element to contain the header with controls and the infoj table with inputs.
        record.drawer = utils.createElement('div', {
            className: 'drawer'
        });

        // Create the header element to contain the control elements
        record.header = utils.createElement('div', {
            textContent: record.letter,
            className: 'header',
            style: 'border-bottom: 3px solid ' + record.color
        });

        // Create the clear control element to control the removal of a feature from the select.layers.
        controls.clear(dom, record);

        // Create the zoom control element which zoom the map to the bounds of the feature.
        controls.zoom(dom, record);

        // Create the expand control element which controls whether the data table is displayed for the feature.
        controls.expander(dom, record);

        // Create control to toggle marker.
        controls.marker(dom, record);

        // Create control to update editable items.
        if (record.layer.editable) controls.update(dom, record);

        // Create control to trash editable items.
        if (record.layer.editable && record.layer.editable === 'geometry') controls.trash(dom, record);

        // Add header element to the drawer.
        record.drawer.appendChild(record.header);

        // Add create and append infoj table to drawer.
        record.drawer.appendChild(select_table.addInfojToList(record));

        // Find free space and insert record.
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });
        let idx = _xyz.select.records.indexOf(record);
        dom.layers.insertBefore(record.drawer, dom.layers.children[idx]);
    }
}