const L = require('leaflet');
const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = () => {

    // Declare DOM elements
    let dom = {
        btnSearch: document.getElementById('btnGazetteer'),
        group: document.getElementById('Gazetteer'),
        input: document.querySelector('#Gazetteer > input'),
        clear: document.querySelector('#Gazetteer .clear'),
        loader: document.querySelector('#Gazetteer > .loader'),
        result: document.querySelector('#Gazetteer > ul')
    };

    // Set gazetteer defaults if missing from appSettings.
    if (!_xyz.gazetteer.icon) _xyz.gazetteer.icon = svg_symbols.markerColor('#64dd17', '#33691e');
    if (!_xyz.gazetteer.pane) _xyz.gazetteer.pane = ['gazetteer', 550];
    if (!_xyz.gazetteer.style) _xyz.gazetteer.style = {
        stroke: true,
        color: '#090',
        weight: 2,
        fillColor: '#cf9',
        fillOpacity: 0.2
    };

    // Create the gazetteer pane.
    _xyz.map.createPane(_xyz.gazetteer.pane[0]);
    _xyz.map.getPane(_xyz.gazetteer.pane[0]).style.zIndex = _xyz.gazetteer.pane[1];

    // Gazetteer init which is called on change of locale.
    _xyz.gazetteer.init = () => {

        // Empty input value, results and set placeholder.
        dom.input.value = '';
        dom.input.placeholder = _xyz.locales[_xyz.locale].gazetteer[3];
        dom.result.innerHTML = '';

        // Remove existing layer if exists
        if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);
    }
    _xyz.gazetteer.init();

    // Toggle visibility of the gazetteer group
    dom.btnSearch.addEventListener('click', e => {
        utils.toggleClass(e.target, 'active');
        dom.group.style.display =
            dom.group.style.display === 'block' ?
            'none' : 'block';

        if (dom.group.style.display === 'block') dom.input.focus();
    });

    // Toggle visibility of the gazetteer group
    if (dom.clear) dom.clear.addEventListener('click', e => dom.input.value = '');

    // Click event for results list
    dom.result.addEventListener('click', e => {
        if (!e.target['data-source']) return;
        selectResult(e.target['data-id'], e.target['data-source'], e.target.innerHTML);
    });
    
    // Initiate search on keyup with input value
    dom.input.addEventListener('keyup', e => {
        let key = e.keyCode || e.charCode,
            val = e.target.value;

        if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && val.length > 0 && isNaN(val.value)) {

            //initiate search if either split value is not a number
            let NaN_check = e.target.value.split(',').map(isNaN);
            if (_xyz.gazetteer.xhrSearch) _xyz.gazetteer.xhrSearch.abort();
            if (NaN_check[0] || NaN_check[1]) initiateSearch(val);
        }
    });

    // Initiate search request
    function initiateSearch(searchValue){

        // Show loader while waiting for results from XHR.
        dom.loader.style.display = 'block';
        dom.result.innerHTML = '';

        _xyz.gazetteer.xhrSearch = new XMLHttpRequest();
        _xyz.gazetteer.xhrSearch.open('GET', host + 'api/gazetteer/autocomplete?' + utils.paramString({
            provider: _xyz.locales[_xyz.locale].gazetteer[0],
            locale: _xyz.locales[_xyz.locale].gazetteer[1],
            bounds: encodeURIComponent(_xyz.locales[_xyz.locale].gazetteer[2]),
            q: encodeURIComponent(searchValue)
        }));

        _xyz.gazetteer.xhrSearch.onload = e => {

            dom.loader.style.display = 'none';

            // List results or show that no results were found
            if (e.target.status === 200) {
                let json = JSON.parse(e.target.responseText);

                if (json.length === 0) {
                    utils._createElement({
                        tag: 'li',
                        options: {
                            textContent: 'No results for this search.'
                        },
                        style: {
                            padding: '5px 0'
                        },
                        appendTo: dom.result
                    })
                    return
                }

                for (let key in json) {
                    utils._createElement({
                        tag: 'li',
                        options: {
                            textContent: json[key].label,
                            'data-id': json[key].id,
                            'data-source': json[key].source
                        },
                        appendTo: dom.result
                    })
                }
            }
        };
        _xyz.gazetteer.xhrSearch.send();
    }

    // Keydown events
    dom.input.addEventListener('keydown', e => {
        let key = e.keyCode || e.charCode,
            results = dom.result.querySelectorAll('li');

        // Move up through results with up key
        if (key === 38) {
            let i = utils.indexInParent(dom.result.querySelector('.active'));
            if (i > 0) utils.toggleClass([results[i],results[i - 1]],'active');
        }

        // Move down through results with down key
        if (key === 40) {
            let i = utils.indexInParent(dom.result.querySelector('.active'));
            if (i < results.length - 1) utils.toggleClass([results[i],results[i + 1]],'active');
        }

        // Cancel search and set results to empty on backspace or delete keydown
        if (key === 46 || key === 8) {
            if (_xyz.gazetteer.xhrSearch) _xyz.gazetteer.xhrSearch.abort();
            dom.result.innerHTML = '';
            if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);
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

            if(!activeRecord && results.length > 0) activeRecord = results[0];

            if (activeRecord['data-id']) selectResult(activeRecord['data-id'], activeRecord['data-source'], activeRecord.innerText);
        }
    });

    // Cancel search and empty results on input focusout
    dom.input.addEventListener('focusout', e => {
        if (_xyz.gazetteer.xhrSearch) _xyz.gazetteer.xhrSearch.abort();
        setTimeout(() => {
            dom.result.innerHTML = '';
        }, 400);
    });

    // Query the geometry via the select id from backend.
    function selectResult(id, source, label) {
        dom.result.innerHTML = '';
        dom.input.value = label;

        if (id && source === 'vector' && _xyz.vector.display) {
            _xyz.vector.selectLayer(id, true);
            return;
        }

        if (id && source === 'mapbox') {

            // Create a point feature from the lat lon in the MapBox ID.
            createFeature({
                "type": "Point",
                "coordinates": id
            })
            return;
        }

        // Get the geometry from the gazetteer database.
        let xhr = new XMLHttpRequest();

        xhr.open('GET', host
            + (source === 'google' ?
                'api/gazetteer/googleplaces' :
                'api/gazetteer/glxplaces')
            + '?id=' + id);

        xhr.onload = e => {

            // Send results to createFeature
            if (e.target.status === 200) createFeature(JSON.parse(e.target.responseText));

        };
        xhr.send();
    }

    // Create a feature from geojson
    function createFeature(geom) {

        // Parse json if geom is string
        geom = typeof(geom) === 'string' ? JSON.parse(geom) : geom;

        // Add geometry to the gazetteer layer
        if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);
        _xyz.gazetteer.layer = L.geoJson(geom, {
            interactive: false,
            pane: _xyz.gazetteer.pane[0],
            pointToLayer: function (feature, latlng) {
                return new L.Marker(latlng, {
                    interactive: false,
                    pane: _xyz.gazetteer.pane[0],
                    icon: L.icon({
                        iconUrl: _xyz.gazetteer.icon,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })
                });
            },
            style: _xyz.gazetteer.style
        }).addTo(_xyz.map);

        // Zoom to the extent of the gazetteer layer
        _xyz.map.fitBounds(_xyz.gazetteer.layer.getBounds());
    }
}