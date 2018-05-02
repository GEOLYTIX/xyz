const L = require('leaflet');
const utils = require('./utils');
const svg_symbols = require('./svg_symbols');

module.exports = function Gazetteer() {

    // Declare DOM elements
    let dom = {
        btnSearch: document.getElementById('btnSearch'),
        btnGeolocate: document.getElementById('btnGeolocate'),
        btnClear: document.getElementById('gaz_clear'),
        group: document.getElementById('gaz_group'),
        input: document.getElementById('GazetteerInput'),
        result: document.getElementById('gaz_result'),
        locale: document.getElementById('Locale')
    };

    // Set gazetteer defaults if missing from appSettings.
    if (!_xyz.gazetteer.icon) _xyz.gazetteer.icon = svg_symbols.markerColor('#64dd17', '#33691e');
    if (!_xyz.gazetteer.pane) _xyz.gazetteer.pane = ["gazetteer", 550];
    if (!_xyz.gazetteer.style) _xyz.gazetteer.style = {
        "stroke": true,
        "color": "#090",
        "weight": 2,
        "fillColor": "#cf9",
        "fillOpacity": 0.2
    };

    // Create the gazetteer pane.
    _xyz.map.createPane(_xyz.gazetteer.pane[0]);
    _xyz.map.getPane(_xyz.gazetteer.pane[0]).style.zIndex = _xyz.gazetteer.pane[1];

    Object.keys(_xyz.locales).forEach(locale => {
        utils._createElement({
            tag: 'option',
            options: {
                textContent: _xyz.locales[locale].name || locale,
                value: locale
            },
            appendTo: dom.locale
        })
    })

    // onchange event to set the hook and title.
    dom.locale.onchange = e => {
        _xyz.locale = e.target.value;

        // Empty input value, results and set placeholder.
        dom.input.value = '';
        dom.input.placeholder = _xyz.locales[_xyz.locale].gazetteer[3];
        dom.result.innerHTML = '';

        _xyz.removeHooks();
        _xyz.setHook('locale', _xyz.locale);
        _xyz.setView(true);
        if (_xyz.layers) _xyz.layers.init(true);
        if (_xyz.select) _xyz.select.init(true);
        if (_xyz.grid) _xyz.grid.init(true);
        if (_xyz.catchments) _xyz.catchments.init(true);
    };

    // Set the select from either hook[query] or layer[query].
    dom.locale.selectedIndex = _xyz.hooks.locale ? utils.getSelectOptionsIndex(dom.locale, _xyz.hooks.locale) : 0;

    // Empty input value, results and set placeholder.
    dom.input.value = '';
    dom.input.placeholder = _xyz.locales[_xyz.locale].gazetteer[3];
    dom.result.innerHTML = '';

    // Remove existing layer if exists
    if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);

    // Toggle visibility of the gazetteer group
    dom.btnSearch.addEventListener('click', function () {
        utils.toggleClass(this, 'active');
        dom.group.style.display =
            dom.group.style.display === 'block' ?
            'none' : 'block';

        if (view_mode === 'desktop') document.getElementById('gaz_spacer').style.display = dom.group.style.display === 'block' ? 'block' : 'none';

        if (dom.group.style.display === 'block') dom.input.focus();
    });

    // Toggle visibility of the gazetteer group
    if (dom.btnClear) dom.btnClear.addEventListener('click', e => {
        dom.input.value = '';
    });

    // Click event for results list
    dom.result.addEventListener('click', function(event){
        selectResult(event.target.dataset.id, event.target.dataset.source, event.target.innerHTML);
    });
    
    // Initiate search on keyup with input value
    dom.input.addEventListener('keyup', function (e) {
        let key = e.keyCode || e.charCode;
        if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && this.value.length > 0 && isNaN(this.value)) {

            //initiate search if either split value is not a number
            let NaN_check = this.value.split(',').map(isNaN);
            if (_xyz.gazetteer.xhrSearch) _xyz.gazetteer.xhrSearch.abort();
            if (NaN_check[0] || NaN_check[1]) initiateSearch(this.value);
        }
    });

    // Initiate search request
    function initiateSearch(searchValue){

        _xyz.gazetteer.xhrSearch = new XMLHttpRequest();
        _xyz.gazetteer.xhrSearch.open('GET', host + 'q_gazetteer?' + utils.paramString({
            provider: _xyz.locales[_xyz.locale].gazetteer[0],
            locale: _xyz.locales[_xyz.locale].gazetteer[1],
            bounds: encodeURIComponent(_xyz.locales[_xyz.locale].gazetteer[2]),
            q: encodeURIComponent(searchValue)
        }));

        _xyz.gazetteer.xhrSearch.onload = function () {

            // List results or show that no results were found
            if (this.status === 200) {
                let json = JSON.parse(this.responseText),
                    results = json.length === 0 ? '<p><small>No results for this search.</small></p>' : '';
                for (let key in json) {
                    results += '<li data-id="'+ json[key].id +'" data-source="'+ json[key].source +'">' + json[key].label + '</li>';
                }
                dom.result.innerHTML = results;
            }
        };
        _xyz.gazetteer.xhrSearch.send();

        // Display search animation
        dom.result.innerHTML = '<li class="spinner"><span class="bounce1"></span><span class="bounce2"></span><span class="bounce3"></span></li>';
    }

    // Keydown events
    dom.input.addEventListener('keydown', function (e) {
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
            let latlng = this.value.split(',').map(parseFloat);
            if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
                dom.result.innerHTML = '';
                createFeature({
                    type: 'Point',
                    coordinates: [latlng[1], latlng[0]]
                });
            }

            // Select active results record
            let activeRecord = results[utils.indexInParent(dom.result.querySelector('.active'))];
            if (activeRecord) selectResult(activeRecord.dataset.id, activeRecord.dataset.source, activeRecord.innerText);
        }
    });

    // Cancel search and empty results on input focusout
    dom.input.addEventListener('focusout', function (e) {
        if (_xyz.gazetteer.xhrSearch) _xyz.gazetteer.xhrSearch.abort();
        setTimeout(function () {
            dom.result.innerHTML = '';
        }, 400);
    });

    // Query the geometry via the select id from backend.
    function selectResult(id, source, label) {
        dom.result.innerHTML = '';
        dom.input.value = label;

        if (id && source === 'vector' && _xyz.vector.display) {
            _xyz.vector.selectLayer(id, true);
        } else if (id && source === 'mapbox') {

            // Create a point feature from the lat lon in the MapBox ID.
            createFeature({
                "type": "Point",
                "coordinates": id.split(',')
            })

        } else {

            // Get the geometry from the gazetteer database.
            let xhr = new XMLHttpRequest();
            //let service = source === 'google'? 'q_gazetteer_googleplaces' : 'q_gazetteer_places';
            xhr.open('GET', host
                + (source === 'google' ?
                    'q_gazetteer_googleplaces' :
                    'q_gazetteer_places')
                + '?id=' + id);
            xhr.onload = function () {

                // Send results to createFeature
                if (this.status === 200) {
                    createFeature(JSON.parse(this.responseText))
                }
            };
            xhr.send();
        }
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


    // Geolocation control
    dom.btnGeolocate.addEventListener('click', function () {
        utils.toggleClass(this, 'active');
        let flyTo = true;
               
        if (!_xyz.gazetteer.geolocationMarker) {
            dom.btnGeolocate.children[0].textContent = 'gps_fixed';
            _xyz.gazetteer.geolocationMarker = L.marker([0, 0], {
                interactive: false,
                icon: L.icon({
                    iconUrl: svg_symbols.markerGeolocation(),
                    iconSize: 30
                })
            });
        }

        if (utils.hasClass(this, 'active') && _xyz.gazetteer.geolocationMarker.getLatLng().lat !== 0) {
            _xyz.gazetteer.geolocationMarker.addTo(_xyz.map);
            if (flyTo) _xyz.map.flyTo(
                _xyz.gazetteer.geolocationMarker.getLatLng(),
                _xyz.locales[_xyz.locale].maxZoom);
            flyTo = false;
        } else {
            _xyz.map.removeLayer(_xyz.gazetteer.geolocationMarker);
        }          

        if (!_xyz.gazetteer.geolocationWatcher) {
            _xyz.gazetteer.geolocationWatcher = navigator.geolocation.watchPosition(
                function (position) {

                    //console.log('position: ' + [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)]);

                    if (utils.hasClass(dom.btnGeolocate, 'active')) {
                        _xyz.map.removeLayer(_xyz.gazetteer.geolocationMarker);
                        _xyz.gazetteer.geolocationMarker.setLatLng([parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)]);
                        _xyz.gazetteer.geolocationMarker.addTo(_xyz.map);

                        if (flyTo) _xyz.map.flyTo(
                            [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)],
                            _xyz.locales[_xyz.locale].maxZoom);
                        flyTo = false;
                    }    
                },
                function (err) {
                    console.error(err);
                },
                {
                    //enableHighAccuracy: false,
                    //timeout: 3000,
                    //maximumAge: 0
                });
        }
    });
}