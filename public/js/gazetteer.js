const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = () => {

    // Declare DOM elements
    const dom = {
        btnSearch: document.getElementById('btnGazetteer'),
        group: document.getElementById('Gazetteer'),
        input: document.querySelector('#Gazetteer > input'),
        clear: document.querySelector('#Gazetteer .clear'),
        loader: document.querySelector('#Gazetteer > .loader'),
        result: document.querySelector('#Gazetteer > ul')
    };

    // Set gazetteer defaults if missing from appSettings.
    if (!global._xyz.gazetteer) global._xyz.gazetteer = {};
    if (!global._xyz.gazetteer.icon) global._xyz.gazetteer.icon = svg_symbols.create({type: "markerColor", style: {colorMarker: '#64dd17', colorDot: '#33691e'}});
    if (!global._xyz.gazetteer.pane) global._xyz.gazetteer.pane = 550;
    if (!global._xyz.gazetteer.style) global._xyz.gazetteer.style = {
        stroke: true,
        color: '#090',
        weight: 2,
        fillColor: '#cf9',
        fillOpacity: 0.2,
        fill: true
    };

    // Create the gazetteer pane.
    global._xyz.map.createPane('gazetteer');
    global._xyz.map.getPane('gazetteer').style.zIndex = global._xyz.gazetteer.pane;

    // Gazetteer init which is called on change of locale.
    global._xyz.gazetteer.init = () => {

        // Hide gazetteer button if no gazetteer is set for the locale.
        if (!global._xyz.locales[global._xyz.locale].gazetteer) {
            utils.removeClass(dom.btnSearch, 'active');
            dom.btnSearch.style.display = 'none';
            dom.group.style.display = 'none';
            return;

        } else {
            dom.btnSearch.style.display = 'block';
        }

        // Empty input value, results and set placeholder.
        dom.input.value = '';
        dom.input.placeholder = global._xyz.locales[global._xyz.locale].gazetteer.placeholder || '';
        dom.result.innerHTML = '';

        // Remove existing layer if exists
        if (global._xyz.gazetteer.layer) global._xyz.map.removeLayer(global._xyz.gazetteer.layer);
    }
    global._xyz.gazetteer.init();

    // Toggle visibility of the gazetteer group
    dom.btnSearch.addEventListener('click', e => {
        utils.toggleClass(e.target, 'active');
        dom.group.style.display =
            dom.group.style.display === 'block' ? 'none' : 'block';

        if (dom.group.style.display === 'block') dom.input.focus();
    });

    // Toggle visibility of the gazetteer group
    if (dom.clear) dom.clear.addEventListener('click', () => dom.input.value = '');

    // Initiate search on keyup with input value
    dom.input.addEventListener('keyup', e => {
        let key = e.keyCode || e.charCode,
            val = e.target.value;

        if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && val.length > 0 && isNaN(val.value)) {

            //initiate search if either split value is not a number
            let NaN_check = e.target.value.split(',').map(isNaN);
            if (global._xyz.gazetteer.xhrSearch) global._xyz.gazetteer.xhrSearch.abort();
            if (NaN_check[0] || NaN_check[1]) initiateSearch(val, dom);
        }
    });

    // Keydown events
    dom.input.addEventListener('keydown', e => {
        let key = e.keyCode || e.charCode,
            results = dom.result.querySelectorAll('li');

        // Move up through results with up key
        if (key === 38) {
            let i = utils.indexInParent(dom.result.querySelector('.active'));
            if (i > 0) utils.toggleClass([results[i], results[i - 1]], 'active');
        }

        // Move down through results with down key
        if (key === 40) {
            let i = utils.indexInParent(dom.result.querySelector('.active'));
            if (i < results.length - 1) utils.toggleClass([results[i], results[i + 1]], 'active');
        }

        // Cancel search and set results to empty on backspace or delete keydown
        if (key === 46 || key === 8) {
            if (global._xyz.gazetteer.xhrSearch) global._xyz.gazetteer.xhrSearch.abort();
            dom.result.innerHTML = '';
            if (global._xyz.gazetteer.layer) global._xyz.map.removeLayer(global._xyz.gazetteer.layer);
        }

        // Select first result on enter keypress
        if (key === 13) {

            // Get possible coordinates from input and draw location if valid
            let latlng = e.target.value.split(',').map(parseFloat);
            if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
                dom.result.innerHTML = '';
                createFeature({
                    type: 'Point',
                    coordinates: [latlng[1], latlng[0]]
                });
            }

            // Select active results record
            let activeRecord = results[utils.indexInParent(dom.result.querySelector('.active'))];

            if (!activeRecord && results.length > 0) activeRecord = results[0];

            if (activeRecord['data-id']) selectResult(activeRecord, dom);
        }
    });

    // Click event for results list
    dom.result.addEventListener('click', e => {
        if (!e.target['data-source']) return;
        if (e.target['data-id']) selectResult(e.target, dom);
    });

    // Cancel search and empty results on input focusout
    dom.input.addEventListener('focusout', () => {
        if (global._xyz.gazetteer.xhrSearch) global._xyz.gazetteer.xhrSearch.abort();
        setTimeout(() => dom.result.innerHTML = '', 400);
    });
}

// Initiate search request
function initiateSearch(searchValue, dom) {

    // Show loader while waiting for results from XHR.
    dom.loader.style.display = 'block';
    dom.result.innerHTML = '';

    global._xyz.gazetteer.xhrSearch = new XMLHttpRequest();
    global._xyz.gazetteer.xhrSearch.open('GET', global._xyz.host + '/api/gazetteer/autocomplete?' + utils.paramString({
        locale: global._xyz.locale,
        q: encodeURIComponent(searchValue)
    }));

    global._xyz.gazetteer.xhrSearch.onload = e => {

        dom.loader.style.display = 'none';

        // catch error here.

        // List results or show that no results were found
        if (e.target.status === 200) {
            let json = JSON.parse(e.target.responseText);

            if (json.length === 0) {
                utils._createElement({
                    tag: 'li',
                    options: { textContent: 'No results for this search.' },
                    style: { padding: '5px 0' },
                    appendTo: dom.result
                })
                return;
            }

            for (let key in json) {
                utils._createElement({
                    tag: 'li',
                    options: {
                        textContent: json[key].label,
                        'data-id': json[key].id,
                        'data-layer': json[key].layer || '',
                        'data-table': json[key].table || '',
                        'data-marker': json[key].marker || '',
                        'data-source': json[key].source
                    },
                    appendTo: dom.result
                })
            }
        }
    };
    global._xyz.gazetteer.xhrSearch.send();
}

function selectResult(record, dom) {
    dom.result.innerHTML = '';
    dom.input.value = record.innerText;

    if (record['data-source'] === 'glx') {
        global._xyz.select.selectLayerFromEndpoint({
            layer: record['data-layer'],
            table: record['data-table'],
            id: record['data-id'],
            marker: record['data-marker'].split(',')
        });
        return;
    }

    if (record['data-source'] === 'mapbox') {
        createFeature({
            type: 'Point',
            coordinates: record['data-marker']
        })
        return;
    }

    if (record['data-source'] === 'google') {

        // Get the geometry from the gazetteer database.
        let xhr = new XMLHttpRequest();

        xhr.open('GET', global._xyz.host + '/api/gazetteer/googleplaces?id=' + record['data-id']);

        xhr.onload = e => {

            // Send results to createFeature
            if (e.target.status === 200) createFeature(JSON.parse(e.target.responseText));

        };
        xhr.send();
    }
}

// Create a feature from geojson
function createFeature(geom) {

    // Parse json if geom is string
    geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;

    // Add geometry to the gazetteer layer
    if (global._xyz.gazetteer.layer) global._xyz.map.removeLayer(global._xyz.gazetteer.layer);
    global._xyz.gazetteer.layer = L.geoJson(geom, {
        interactive: false,
        pane: 'gazetteer',
        pointToLayer: function (feature, latlng) {
            return new L.Marker(latlng, {
                interactive: false,
                pane: 'gazetteer',
                icon: L.icon({
                    iconUrl: global._xyz.gazetteer.icon,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                })
            });
        },
        style: global._xyz.gazetteer.style
    }).addTo(global._xyz.map);

    // Zoom to the extent of the gazetteer layer
    global._xyz.map.fitBounds(global._xyz.gazetteer.layer.getBounds());
}