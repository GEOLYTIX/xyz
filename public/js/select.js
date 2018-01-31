const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function Select(){

    // Set dom elements for the select module.
    let dom = {
        container: document.querySelector('#select_module > .swipe_container'),
        table: document.querySelector('#select_module .infoj'),
        pages: document.querySelectorAll('#select_module .page_content'),
        header: document.querySelectorAll('#select_module .page_header'),
        btnOff: document.querySelector('#select_module .btnOff')
    };

    // Create select pane. This pane has a shadow filter associated in the css.
    _xyz.map.createPane('select');
    _xyz.map.getPane('select').style.zIndex = 540;
    // let sheet = document.styleSheets[1];
    // sheet.insertRule(".page_content { background-color: red; }", 1);

    // init() is called upon initialisation and when the country is changed (change_country === true).
    _xyz.select.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) resetModule();

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_xyz.hooks.select) _xyz.hooks.select.map(function(hook) {
            let selectionHook = hook.split('!');
            selectLayerFromEndpoint({
                qTable: selectionHook[1],
                qID: selectionHook[2],
                marker: [selectionHook[3].split(';')[0], selectionHook[3].split(';')[1]]
            });
        });
        _xyz.removeHook('select');
    }
    _xyz.select.init();

    // Reset the module on btnOff click.
    dom.btnOff.addEventListener('click', function(){
        resetModule();
    });

    // Reset function for the module container.
    function resetModule() {
        dom.pages[1].innerHTML = '';
        dom.pages[0].style.display = 'block';
        dom.container.style.marginLeft = '0';
        _xyz.removeHook('select');
        _xyz.select.records.map(function (record) {
            if (record.layer && record.layer.L) _xyz.map.removeLayer(record.layer.L);
            if (record.layer && record.layer.M) _xyz.map.removeLayer(record.layer.M);
            record.layer = null;
        });
    }

    // Get layer from data source
    function selectLayerFromEndpoint(layer) {
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });
        if (freeRecords.length === 0) return

        ///// Needs adding query for database and request endpoint at this stage. Can be queried from countries.layers.
        let endpoint = 'q_vector_gjson_info?';
        let qDB = 'XYZ'; /////

        // Create new xhr for /q_vector_gjson_info
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + endpoint + utils.paramString({
            qDB: qDB,
            qTable: layer.qTable,
            qID: layer.qID
        }));
    
        // Request infoj and geometry from data source
        xhr.onload = function () {
            if (this.status === 200) {
    
                let json = JSON.parse(this.responseText),
                    areaj = JSON.parse(json[0].areaj) || null;
    
                layer.geometry = JSON.parse(json[0].geomj);
                layer.infoj = JSON.parse(json[0].infoj);
    
                addLayerToRecord(layer);
            }
        }
        xhr.send();
    }
    _xyz.select.selectLayerFromEndpoint = selectLayerFromEndpoint;

    function addLayerToRecord(layer){
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        dom.header[1].style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - (((freeRecords.length - 1) / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

        if (freeRecords.length > 0) {
            freeRecords[0].layer = layer;
            _xyz.pushHook('select', freeRecords[0].letter + '!' + freeRecords[0].layer.qTable + '!' + freeRecords[0].layer.qID + '!' + freeRecords[0].layer.marker[0] + ';' + freeRecords[0].layer.marker[1]);
            addRecordToMap(freeRecords[0])
        }
        if (freeRecords.length === 1) dom.header[1].style.background = '#ffcc80';
    }
    _xyz.select.addLayerToRecord = addLayerToRecord;

    function addRecordToMap(record) {
        dom.container.style.marginLeft = '-50%';

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
                            interactive: false
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
                    weight: 2,
                    fill: false
                },
                pointToLayer: function (feature, latlng) {
                    return new L.Marker(latlng, {
                        icon: L.icon({
                            iconUrl: svg_symbols.markerLetter(record.color, record.letter),
                            iconSize: [40, 40],
                            iconAnchor: [20, 40]
                        }),
                        interactive: false
                    });
                }
            }).addTo(_xyz.map);

            addRecordToList(record);
    }

    function addRecordToList(record) {

        // Create container element to contain the header with controls and the info table.
        record.layer.container = document.createElement('div');
        record.layer.container.className = 'infojContainer';

        // Create the header element to contain the control elements
        let header = utils.createElement('div', {
            textContent: record.letter,
            className: 'infojHeader'
        });
        header.style.height = '25px';
        header.style.borderBottom = '3px solid ' + record.color;

        // Create the clear control element to control the removal of a feature from the select.layers.
        let i = utils.createElement('i', {
            textContent: 'clear',
            className: 'material-icons cursor noselect infojBtn',
            title: 'Remove feature from selection'
        });
        i.style.color = record.color;
        i.addEventListener('click', function(){
            record.layer.container.remove();

            _xyz.filterHook('select', record.letter + '!' + record.layer.qTable + '!' + record.layer.qID + '!' + record.layer.marker[0] + ';' + record.layer.marker[1]);
            if (record.layer.L) _xyz.map.removeLayer(record.layer.L);
            if (record.layer.M) _xyz.map.removeLayer(record.layer.M);
            record.layer = null;

            let freeRecords = _xyz.select.records.filter(function (record) {
                if (!record.layer) return record
            });
    
            dom.header[1].style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((freeRecords.length / _xyz.select.records.length) * 100)) + '%, #eee 0%)';

            if (freeRecords.length === _xyz.select.records.length) resetModule();
        });
        header.appendChild(i);

        // Create the zoom control element which zoom the map to the bounds of the feature.
        i = utils.createElement('i', {
            textContent: 'search',
            className: 'material-icons cursor noselect infojBtn',
            title: 'Zoom map to feature bounds'
        });
        i.style.color = record.color;
        i.addEventListener('click', function(){
            _xyz.map.flyToBounds(record.layer.L.getBounds());
        });
        header.appendChild(i);
        
        // Create the expand control element which controls whether the data table is displayed for the feature.
        i = utils.createElement('i', {
            textContent: 'expand_less',
            className: 'material-icons cursor noselect infojBtn',
            title: 'Expand table'
        });
        i.style.color = record.color;
        i.addEventListener('click', function(){
            let container = this.parentNode.parentNode;
            let header = this.parentNode;
            if (container.style.maxHeight != '30px') {
                container.style.maxHeight = '30px';
                header.style.boxShadow = '0 3px 3px -3px black';
                this.textContent = 'expand_more';
                i.title="Hide table";
            } else {
                container.style.maxHeight = (header.nextSibling.clientHeight + this.clientHeight + 5) + 'px';
                header.style.boxShadow = '';
                this.textContent = 'expand_less';
                i.title="Expand table";
            }
        });
        header.appendChild(i);

        // Create control to toggle marker.
        if (record.layer.marker) {
            i = utils.createElement('i', {
                textContent: 'location_off',
                className: 'material-icons cursor noselect infojBtn',
                title: 'Hide marker'
            });
            i.style.color = record.color;
            i.addEventListener('click', function () {
                let container = this.parentNode.parentNode;
                let header = this.parentNode;
                if (this.textContent === 'location_off') {
                    _xyz.map.removeLayer(record.layer.M);
                    this.textContent = 'location_on';
                    i.title = 'Show marker';
                } else {
                    _xyz.map.addLayer(record.layer.M);
                    this.textContent = 'location_off';
                    i.title = 'Hide marker';
                }
            });
            header.appendChild(i);
        }

        // Create the expand control element which controls whether the data table is displayed for the feature.
        // i = utils.createElement('i', {
        //     textContent: 'view_week',
        //     className: 'material-icons cursor noselect infojBtn',
        //     title: 'Add feature to comparison table'
        // });
        // i.style.color = record.color;
        // i.addEventListener('click', function () {
        // });
        // header.appendChild(i);

        // Add header element to the container.
        record.layer.container.appendChild(header);

        // Create table element to display the features properties.
        let table = document.createElement('table');
        table.className = 'infojTable';
        table.style.borderBottom = '1px solid ' + record.color;
        table.cellpadding = '0';
        table.cellspacing = '0';

        // Add table element to the container.
        record.layer.container.appendChild(table);

        // Filter empty features from select.layers;
        let freeRecords = _xyz.select.records.filter(function (record) {
            if (!record.layer) return record
        });

        // Insert container before the next container (alphabetical order) which is not empty or at the end (null).
        let idx = _xyz.select.records.indexOf(record);

        dom.pages[1].insertBefore(record.layer.container,dom.pages[1].children[idx]);

        // Populate the table from the features infoj object.
        Object.keys(record.layer.infoj).map(function (key) {
            (function processDataRow(lv, key, val) {

                if (typeof val === 'object') {
                    if (key.charAt(key.length -1) != '_') addToTable(lv, key, '');
                    Object.keys(val).map(function (key) {
                        processDataRow(lv + 1, key, val[key]);
                    });
                } else {
                    addToTable(lv, key, val);
                }

                function addToTable(lv, key, val) {
                    let tr = document.createElement('tr');
                    let td = document.createElement('td');
                    td.className = 'lv-' + lv;
                    td.textContent = key;
                    tr.appendChild(td);

                    if (isNaN(val)) {
                        table.appendChild(tr);
                        tr = document.createElement('tr');
                        td = document.createElement('td');
                        td.textContent = val;
                        td.colSpan = '2';

                    } else {
                        td = document.createElement('td');
                        td.textContent = val;
                    }

                    td.className = 'val';
                    tr.appendChild(td);
                    table.appendChild(tr);
                }

            })(0, key, record.layer.infoj[key])
        });
    }
}