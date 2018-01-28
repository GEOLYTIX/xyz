const L = require('leaflet');
const helper = require('./helper');

module.exports = function Gazetteer(_this) {

    // locale.gazetteer is called upon initialisation and when the country is changed (change_country === true).
    _this.locale.gazetteer = function () {

        // Empty input value, results and set placeholder.
        _this.gazetteer.input.value = '';
        _this.gazetteer.input.placeholder = _this.countries[_this.country].placeholder;
        _this.gazetteer.result.innerHTML = '';

        // Remove existing layer if exists
        if (_this.gazetteer.layer) _this.map.removeLayer(_this.gazetteer.layer);
    };
    _this.locale.gazetteer();

    // Toggle visibility of the gazetteer group
    _this.gazetteer.btnSearch.addEventListener('click', function () {
        helper.toggleClass(this, 'active');
        _this.gazetteer.group.style.display =
            _this.gazetteer.group.style.display === 'block' ?
            'none' : 'block';

        if (view_mode === 'desktop') {
            document.getElementById('gaz_spacer').style.display = _this.gazetteer.group.style.display === 'block' ?
                'block' : 'none';
        }

        if (_this.gazetteer.group.style.display === 'block') _this.gazetteer.input.focus();
    });

    // Click event for results list
    _this.gazetteer.result.addEventListener('click', function(event){
        selectResult(event.target.dataset.id, event.target.dataset.source, event.target.innerHTML);
    });

    // Initiate search on keyup with input value
    _this.gazetteer.input.addEventListener('keyup', function (e) {
        let key = e.keyCode || e.charCode;
        if (key !== 37 && key !== 38 && key !== 39 && key !== 40 && key !== 13 && this.value.length > 0 && isNaN(this.value)) {

            //initiate search if either split value is not a number
            let NaN_check = this.value.split(',').map(isNaN);
            if (_this.gazetteer.xhrSearch) _this.gazetteer.xhrSearch.abort();
            if (NaN_check[0] || NaN_check[1]) initiateSearch(this.value);
        }
    });

    // Initiate search request
    function initiateSearch(searchValue){
        _this.gazetteer.xhrSearch = new XMLHttpRequest();
        _this.gazetteer.xhrSearch.open('GET', localhost + 'q_gazetteer?' + helper.paramString({
            c: _this.country,
            q: encodeURIComponent(searchValue),
            p: _this.gazetteer.provider
        }));
        _this.gazetteer.xhrSearch.onload = function () {

            // List results or show that no results were found
            if (this.status === 200) {
                let json = JSON.parse(this.responseText),
                    results = json.length === 0 ? '<p><small>No results for this search.</small></p>' : '';
                for (let key in json) {
                    results += '<li data-id="'+ json[key].id +'" data-source="'+ json[key].source +'">' + json[key].label + '</li>';
                }
                _this.gazetteer.result.innerHTML = results;
            }
        };
        _this.gazetteer.xhrSearch.send();

        // Display search animation
        _this.gazetteer.result.innerHTML = '<li class="spinner"><span class="bounce1"></span><span class="bounce2"></span><span class="bounce3"></span></li>';
    }

    // Keydown events
    _this.gazetteer.input.addEventListener('keydown', function (e) {
        let key = e.keyCode || e.charCode,
            results = _this.gazetteer.result.querySelectorAll('li');

        // Move up through results with up key
        if (key === 38) {
            let i = helper.indexInParent(_this.gazetteer.result.querySelector('.active'));
            if (i > 0) helper.toggleClass([results[i],results[i - 1]],'active');
        }

        // Move down through results with down key
        if (key === 40) {
            let i = helper.indexInParent(_this.gazetteer.result.querySelector('.active'));
            if (i < results.length - 1) helper.toggleClass([results[i],results[i + 1]],'active');
        }

        // Cancel search and set results to empty on backspace or delete keydown
        if (key === 46 || key === 8) {
            if (_this.gazetteer.xhrSearch) _this.gazetteer.xhrSearch.abort();
            _this.gazetteer.result.innerHTML = '';
            if (_this.gazetteer.layer) _this.map.removeLayer(_this.gazetteer.layer);
        }

        // Select first result on enter keypress
        if (key === 13) {

            // Get possible coordinates from input and draw location if valid
            let latlng = this.value.split(',').map(parseFloat);
            if ((latlng[1] > -90 && latlng[1] < 90) && (latlng[0] > -180 && latlng[0] < 180)) {
                _this.gazetteer.result.innerHTML = '';
                createFeature({
                    type: 'Point',
                    coordinates: [latlng[1], latlng[0]]
                });
            }

            // Select active results record
            let activeRecord = results[helper.indexInParent(_this.gazetteer.result.querySelector('.active'))];
            if (activeRecord) selectResult(activeRecord.dataset.id, activeRecord.dataset.source, activeRecord.innerText);
        }
    });

    // Cancel search and empty results on input focusout
    _this.gazetteer.input.addEventListener('focusout', function (e) {
        if (_this.gazetteer.xhrSearch) _this.gazetteer.xhrSearch.abort();
        setTimeout(function () {
            _this.gazetteer.result.innerHTML = '';
        }, 400);
    });

    // Query the geometry via the select id from backend.
    function selectResult(id, source, label) {
        _this.gazetteer.result.innerHTML = '';
        _this.gazetteer.input.value = label;

        if (id && source === 'vector' && _this.vector.display) {
            _this.vector.selectLayer(id, true);
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
        if (_this.gazetteer.layer) _this.map.removeLayer(_this.gazetteer.layer);
        _this.gazetteer.layer = L.geoJson(geom, {
            interactive: false,
            pointToLayer: function (feature, latlng) {
                return new L.Marker(latlng, {
                    interactive: false,
                    icon: L.icon({
                        iconUrl: _this.gazetteer.icon,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })
                });
            },
            style: _this.gazetteer.style
        }).addTo(_this.map);

        // Zoom to the extent of the gazetteer layer
        _this.map.fitBounds(_this.gazetteer.layer.getBounds());
    }
};