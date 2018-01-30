const utils = require('./utils');
const svg_symbols = require('./svg_symbols.js');

module.exports = function Select(_){

    let dom = {
        container: document.querySelector('#select_module > .swipe_container'),
        table: document.querySelector('#select_module .infoj'),
        pages: document.querySelectorAll('#select_module .page_content'),
        header: document.querySelectorAll('#select_module .page_header'),
        btnOff: document.querySelector('#select_module .btnOff')
    };

    // locale.select is called upon initialisation and when the country is changed (change_country === true).
    _.select.init = function (change_country) {

        // Remove the layers hook on change_country event.
        if (change_country) _.removeHook('select');

        // Set the layer display from hooks if present; Overwrites the default setting.
        if (_.hooks.select) _.hooks.select.map(function(hook) {
            let selectionHook = hook.split('..');

            selectLayer({
                qTable: selectionHook[1],
                qID: selectionHook[2],
                marker: [selectionHook[3].split(';')[0], selectionHook[3].split(';')[1]]
            })
            
        });
        _.removeHook('select');

        // // Remove the layers hook.
        // _.removeHook('select');

        // // Empty the layers table.
        // dom.layersTable.innerHTML = '';
    }
    _.select.init();

    dom.btnOff.addEventListener('click', function(){
        resetModule();
    });

    function resetModule() {
        dom.pages[1].innerHTML = '';
        dom.pages[0].style.display = 'block';
        dom.container.style['marginLeft'] = '0';
        _.removeHook('select');
        _.select.layers.map(function (obj) {
            if (obj.layer) _.map.removeLayer(obj.layer);
            obj.layer = null;
            if (obj.marker) _.map.removeLayer(obj.marker);
            obj.marker = null;
            obj.infoj = null;
            obj.container = null;
        });
    }

    _.select.selectLayer = selectLayer;
    function selectLayer(feature) {

        // Create new xhr for /q_vector_info?
        let xhr = new XMLHttpRequest();
        xhr.open('GET', localhost + 'q_vector_gjson_info?' + utils.paramString({
            qTable: feature.qTable,
            qID: feature.qID
        }));
    
        // Display the selected layer feature on load event.
        xhr.onload = function () {
            if (this.status === 200) {
    
                let json = JSON.parse(this.responseText),
                    areaj = JSON.parse(json[0].areaj) || null;
    
                feature.geometry = JSON.parse(json[0].geomj);
                feature.infoj = JSON.parse(json[0].infoj);
    
                addFeature(feature);
    
            }
        }
    
        xhr.send();
    }

    _.select.addFeature = addFeature;
    function addFeature(feature){
        let space = _.select.layers.filter(function (obj) {
            if (!obj.infoj) return obj
        });

        dom.header[1].style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - (((space.length - 1) / _.select.layers.length) * 100)) + '%, #eee 0%)';

        if (space.length > 0) {
            _.pushHook('select', space[0].letter + '..' + feature.qTable + '..' + feature.qID + '..' + feature.marker[0] + ';' + feature.marker[1]);
            addToSelectLayers(feature, space[0])
        }
    }

    function addToSelectLayers(feature, entry) {
        dom.container.style.marginLeft = '-50%';

        entry.infoj = feature.infoj;

        entry.qTable = feature.qTable;
        entry.qID = feature.qID;

        if (feature.marker) {
            entry.marker = L.geoJson(
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: feature.marker
                    }
                }, {
                    pointToLayer: function (feature, latlng) {
                        return new L.Marker(latlng, {
                            icon: L.icon({
                                iconUrl: svg_symbols.markerLetter(entry.color, entry.letter),
                                iconSize: [40, 40],
                                iconAnchor: [20, 40]
                            }),
                            interactive: false
                        });
                    }
                }).addTo(_.map);
        }

        entry.layer = L.geoJson(
            {
                type: 'Feature',
                geometry: feature.geometry
            }, {
                interactive: false,
                pane: 'shadowFilter',
                style: {
                    stroke: true,
                    color: entry.color,
                    weight: 2,
                    fill: false
                },
                pointToLayer: function (feature, latlng) {
                    return new L.Marker(latlng, {
                        icon: L.icon({
                            iconUrl: svg_symbols.markerLetter(entry.color, entry.letter),
                            iconSize: [40, 40],
                            iconAnchor: [20, 40]
                        }),
                        interactive: false
                    });
                }
            }).addTo(_.map);

        createInfojTable(entry);
    }

    function createInfojTable(feature) {

        // Create container element to contain the header with controls and the info table.
        let container = document.createElement('div');
        feature.container = container;
        container.className = 'infojContainer';

        // Create the header element to contain the control elements
        let header = document.createElement('div');
        header.textContent = feature.letter;
        header.className = 'infojHeader';

        // Create the clear control element to control the removal of a feature from the select.layers.
        let i = document.createElement('i');
        i.textContent = 'clear';
        i.style.color = feature.color;
        i.className = 'material-icons cursor noselect infojBtn';
        i.title="Remove feature from selection";
        i.addEventListener('click', function(){
            this.parentNode.parentNode.remove();
            _.map.removeLayer(feature.layer);
            _.filterHook('select', feature.letter + '..' + feature.qTable + '..' + feature.qID + '..' + feature.marker[0] + ';' + feature.marker[1]);
            feature.layer = null;
            if (feature.marker) _.map.removeLayer(feature.marker);
            feature.marker = null;
            feature.infoj = null;
            feature.container = null;

            let space = _.select.layers.filter(function (obj) {
                if (!obj.infoj) return obj
            });
    
            dom.header[1].style.background = 'linear-gradient(90deg, #cf9 ' + parseInt(100 - ((space.length / _.select.layers.length) * 100)) + '%, #eee 0%)';

        });
        header.appendChild(i);

        // Create the zoom control element which zoom the map to the bounds of the feature.
        i = document.createElement('i');
        i.textContent = 'search';
        i.style.color = feature.color;
        i.className = 'material-icons cursor noselect infojBtn';
        i.title="Zoom map to feature bounds";
        i.addEventListener('click', function(){
            _.map.flyToBounds(feature.layer.getBounds());
        });
        header.appendChild(i);
        
        // Create the expand control element which controls whether the data table is displayed for the feature.
        i = document.createElement('i');
        i.textContent = 'expand_less';
        i.style.color = feature.color;
        i.className = 'material-icons cursor noselect infojBtn';
        i.title="Expand table";
        i.addEventListener('click', function(){
            let container = this.parentNode.parentNode;
            let header = this.parentNode;
            if (container.style.maxHeight != (this.clientHeight + 5) + 'px') {
                container.style.maxHeight = (this.clientHeight + 5) + 'px';
                header.style.boxShadow = '0 7px 6px -4px black';
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
        if (feature.marker) {
            i = document.createElement('i');
            i.textContent = 'location_off';
            i.style.color = feature.color;
            i.className = 'material-icons cursor noselect infojBtn';
            i.title="Hide marker";
            i.addEventListener('click', function () {
                let container = this.parentNode.parentNode;
                let header = this.parentNode;
                if (this.textContent === 'location_off') {
                    _.map.removeLayer(feature.marker);
                    this.textContent = 'location_on';
                    i.title="Show marker";
                } else {
                    _.map.addLayer(feature.marker);
                    this.textContent = 'location_off';
                    i.title="Hide marker";
                }
            });
            header.appendChild(i);
        }

        // Create the expand control element which controls whether the data table is displayed for the feature.
        i = document.createElement('i');
        i.textContent = 'view_week';
        i.style.color = feature.color;
        i.className = 'material-icons cursor noselect infojBtn';
        i.title = "Add feature to comparison table";
        i.addEventListener('click', function () {
        });
        header.appendChild(i);

        // Add header element to the container.
        container.appendChild(header);

        // Create table element to display the features properties.
        let table = document.createElement('table');
        table.className="infojTable";
        table.style.borderTop = '3px solid ' + feature.color;
        table.style.borderBottom = '1px solid ' + feature.color;
        table.cellpadding="0";
        table.cellspacing="0";

        // Add table element to the container.
        container.appendChild(table);

        // Filter empty features from select.layers;
        let space = _.select.layers.filter(function (obj) {
            if (obj.container) return obj
        });

        // Insert container before the next container (alphabetical order) which is not empty or at the end (null).
        dom.pages[1].insertBefore(container, space.length > space.indexOf(feature) + 1 && space[space.indexOf(feature) + 1].container ? space[space.indexOf(feature) + 1].container : null);

        // Populate the table from the features infoj object.
        Object.keys(feature.infoj).map(function (key) {
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

            })(0, key, feature.infoj[key])
        });
    }
}