const utils = require('./utils');
const svg_symbols = require('./svg_symbols');
const controls = require('./select_controls');
const select_table = require('./select_table');

module.exports = function Select() {

    // Set dom elements for the select module.
    let dom = {
        btnOff: document.querySelector('#ClearLocations'),
        layers: document.querySelector('#Locations > .content')
    };

    // Create select pane. This pane has a shadow filter associated in the css.
    _xyz.map.createPane('select_display');
    _xyz.map.getPane('select_display').style.zIndex = 501;
    _xyz.map.createPane('select');
    _xyz.map.getPane('select').style.zIndex = 600;
    _xyz.map.createPane('select_marker');
    _xyz.map.getPane('select_marker').style.zIndex = 601;
    _xyz.map.createPane('select_circle');
    _xyz.map.getPane('select_circle').style.zIndex = 602;

    // Create recordset if it doesn't exist yet.
    if (!_xyz.select.records) _xyz.select.records = [
        {
          "letter": "A",
          "color": "#9c27b0"
        },
        {
          "letter": "B",
          "color": "#2196f3"
        },
        {
          "letter": "C",
          "color": "#009688"
        },
        {
          "letter": "D",
          "color": "#cddc39"
        },
        {
          "letter": "E",
          "color": "#ff9800"
        },
        {
          "letter": "F",
          "color": "#673ab7"
        },
        {
          "letter": "G",
          "color": "#03a9f4"
        },
        {
          "letter": "H",
          "color": "#4caf50"
        },
        {
          "letter": "I",
          "color": "#ffeb3b"
        },
        {
          "letter": "J",
          "color": "#ff5722"
        },
        {
          "letter": "K",
          "color": "#0d47a1"
        },
        {
          "letter": "L",
          "color": "#00bcd4"
        },
        {
          "letter": "M",
          "color": "#8bc34a"
        },
        {
          "letter": "N",
          "color": "#ffc107"
        },
        {
          "letter": "O",
          "color": "#d32f2f"
        }];
    
    // init() is called upon initialisation and when the locale is changed (change_locale === true).
    _xyz.select.init = function (change_locale) {

        // Remove the layers hook on change_locale event.
        if (change_locale) _xyz.select.resetModule();

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
    dom.btnOff.addEventListener('click', () => _xyz.select.resetModule());

    // Reset function for the module container.
    _xyz.select.resetModule = resetModule;
    function resetModule() {
        dom.btnOff.style.display = 'none';
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
    
        let freeRecords = _xyz.select.records.filter(record => !record.layer);

        if (freeRecords.length === 0) return

        // Make select tab active on mobile device.
        if (_xyz.activateSelectTab) _xyz.activateSelectTab();

        let _layer = _xyz.locales[_xyz.locale].layers[layer.layer];

        // infoj fields with a layer definition are queried from the reference layer.
        setLayerReferences(_layer.infoj);

        let xhr = new XMLHttpRequest();
        xhr.open('POST', 'q_select');
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.onload = function () {
            
            // remove wait cursor class if found
            let els = document.querySelectorAll('#map .leaflet-interactive.wait-cursor-enabled');
            //console.log("remove class " + els.length);
            
            for(let el of els){
                el.classList.remove("wait-cursor-enabled");
            }
            
            if (this.status === 200) {
                let json = JSON.parse(this.responseText);
                //console.log(json);
                layer.geometry = JSON.parse(json.geomj);
                layer.infoj = json.infoj;
                layer.editable = _layer.editable;
                layer.geomdisplay = _layer.geomdisplay ? JSON.parse(json.geomdisplay) : null;
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
            geom: _layer.geom,
            geomj: _layer.geomj,
            geomq: _layer.geomq,
            geomdisplay: _layer.geomdisplay
        }));
    }
    _xyz.select.selectLayerFromEndpoint = selectLayerFromEndpoint;

    function setLayerReferences(infoj) {
        infoj.forEach((entry)=>{

            // Create a layer reference for the layer defined in the infoj field.
            if (typeof entry.layer === 'string'){
                entry.layer = {
                    table: _xyz.locales[_xyz.locale].layers[entry.layer].table,
                    geom: _xyz.locales[_xyz.locale].layers[entry.layer].geom || 'geom',
                    filter: _xyz.locales[_xyz.locale].layers[entry.layer].filter || {}
                }
            }
        })
    }

    function addLayerToRecord(layer) {
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        // Set marker coordinates from point geometry.
        if (layer.geometry.type === 'Point') layer.marker = layer.geometry.coordinates;

        dom.btnOff.style.display = 'block';
        // dom.header.style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - (((freeRecords.length - 1) / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

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
        // if (freeRecords.length === 1) dom.header.style.background = '#ffcc80';
    }
    _xyz.select.addLayerToRecord = addLayerToRecord;

    function addRecordToMap(record) {
        if (record.layer.geomdisplay) {
            record.layer.D = L.geoJson(
                {
                    type: 'Feature',
                    geometry: record.layer.geomdisplay
                }, {
                    interactive: false,
                    pane: 'select_display',
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
                            interactive: _xyz.select ? true : false,
                            draggable: record.layer.editable
                        });
                }
            }).addTo(_xyz.map);
       
        record.layer.L.getLayers()[0].on('dragend', function (e) {
            record.upload.style.display = 'block';
        });

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
