const L = require('leaflet');
const utils = require('./utils');

module.exports = function Gazetteer() {

    // Create the gazetteer pane.
    _xyz.map.createPane(_xyz.gazetteer.pane[0]);
    _xyz.map.getPane(_xyz.gazetteer.pane[0]).style.zIndex = _xyz.gazetteer.pane[1];

    let dom = {
        btnSearch: document.getElementById('btnSearch'),
        group: document.getElementById('gaz_group'),
        input: document.getElementById('gaz_input'),
        result: document.getElementById('gaz_result'),
        country: document.getElementById('gaz_country'),
        countrylist: document.getElementById('gaz_countrylist'),
        geolocate: document.getElementById('btnGeolocate')
    };
    
    dom.geolocate.innerHTML = '<i class="material-icons">gps_fixed</i>';
    dom.geolocate.disabled = false;

    // Get list of country keys and assign to country drop down.
    let countries = '';
    for (let key in _xyz.countries) {
        if (_xyz.countries.hasOwnProperty(key)) countries += '<li data-country="' + key + '">' + _xyz.countries[key].name + '</li>';
    }
    dom.countrylist.innerHTML = countries;

    if (Object.keys(_xyz.countries).length > 1) {
        utils.addClass(dom.country, 'active');

        // Add click event to toggle country drop down display.
        dom.country.addEventListener('click', function () {
            dom.countrylist.style.display = dom.countrylist.style.display === 'block' ? 'none' : 'block';
        });

        // Add click event to the countries in drop down.
        let items = dom.countrylist.querySelectorAll('li');
        Object.keys(items).map(function (key) {
            items[key].addEventListener('click', function () {
                dom.countrylist.style.display = 'none';
                _xyz.country = this.dataset.country;
                dom.country.innerHTML = _xyz.country === 'Global' ?
                    '<i class="material-icons">language</i>' :
                    _xyz.country;
                _xyz.removeHooks();
                _xyz.setHook('country', _xyz.country);
                _xyz.setView(true);
                if (_xyz.layers) _xyz.layers.init(true);
                if (_xyz.select) _xyz.select.init(true);
                if (_xyz.grid) _xyz.grid.init(true);
                if (_xyz.catchments) _xyz.catchments.init(true);
            })
        });
    }

    // Set country text in the Gazetteer box.
    dom.country.innerHTML = _xyz.country === 'Global' ?
        '<i class="material-icons">language</i>' :
        _xyz.country;


    // Empty input value, results and set placeholder.
    dom.input.value = '';
    dom.input.placeholder = _xyz.countries[_xyz.country].placeholder;
    dom.result.innerHTML = '';

    // Remove existing layer if exists
    if (_xyz.gazetteer.layer) _xyz.map.removeLayer(_xyz.gazetteer.layer);


    // Toggle visibility of the gazetteer group
    dom.btnSearch.addEventListener('click', function () {
        utils.toggleClass(this, 'active');
        dom.group.style.display =
            dom.group.style.display === 'block' ?
            'none' : 'block';

        if (view_mode === 'desktop') {
            document.getElementById('gaz_spacer').style.display = dom.group.style.display === 'block' ?
                'block' : 'none';
        }

        if (dom.group.style.display === 'block') dom.input.focus();
    });

    // Click event for results list
    dom.result.addEventListener('click', function(event){
        selectResult(event.target.dataset.id, event.target.dataset.source, event.target.innerHTML);
    });
    
    // Click event for geolocation
    dom.geolocate.addEventListener('click', function(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                
                _xyz.map.setView([parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)], 16);
            });
        } else {
            this.innerHTML = '<i class="material-icons">gps_off</i>';
            this.disabled = true;
        }
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
        _xyz.gazetteer.xhrSearch.open('GET', localhost + 'q_gazetteer?' + utils.paramString({
            c: _xyz.country,
            q: encodeURIComponent(searchValue),
            p: _xyz.gazetteer.provider
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
            xhr.open('GET', localhost
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
                    pane: _xyz.catchments.pane[0],
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
};