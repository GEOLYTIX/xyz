const L = require('leaflet');
const helper = require('./helper');

require('leaflet.vectorgrid');

module.exports = function(_this){

    // Get list of country keys and assign to country drop down.
    let countries = '';
    for (let key in _this.countries) {
        if (_this.countries.hasOwnProperty(key)) countries += '<li data-country="'+ key +'">' + _this.countries[key].name + '</li>';
    }
    _this.gazetteer.countrylist.innerHTML = countries;

    if (Object.keys(_this.countries).length > 1) {
        helper.addClass(_this.gazetteer.country, 'active');

        // Add click event to toggle country drop down display.
        _this.gazetteer.country.addEventListener('click', function () {
            _this.gazetteer.countrylist.style.display = _this.gazetteer.countrylist.style.display === 'block' ? 'none' : 'block';
        });

        // Add click event to the countries in drop down.
        let items = _this.gazetteer.countrylist.querySelectorAll('li');
        Object.keys(items).map(function (key) {
            items[key].addEventListener('click', function () {
                _this.gazetteer.countrylist.style.display = 'none';
                _this.country = this.dataset.country;
                changeCountry();
            })
        });
    }
    
    // Initialize container for displayed layers.
    _this.vector.layers = {};


    // Set country to hook, or set hook for country.
    if (_this.hooks.country) {
        _this.country = _this.hooks.country;
    } else {
        _this.setHook('country', _this.country);
    }
    // _this.gazetteer.country.textContent = _this.country;
    _this.gazetteer.country.innerHTML = _this.country === 'Global'? '<i class="material-icons">language</i>': _this.country;

    // Initiate map object.
    _this.map = L.map('map', {
        renderer: L.svg(),
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        minZoom: _this.countries[_this.country].minZoom,
        maxZoom: _this.countries[_this.country].maxZoom
    }).setView([parseFloat(_this.hooks.lat || 0), parseFloat(_this.hooks.lng || 0)], parseInt(_this.hooks.z || 15));
    chkZoomBtn(_this.map.getZoom());

    // Zoom functions
    function chkZoomBtn(z){
        _this.locale.btnZoomIn.disabled = z < _this.countries[_this.country].maxZoom ?  false : true;
        _this.locale.btnZoomOut.disabled = z > _this.countries[_this.country].minZoom ? false : true;
    }

    _this.locale.btnZoomIn.addEventListener('click', function () {
        let z = _this.map.getZoom() + 1;
        _this.map.setZoom(z);
        chkZoomBtn(z);
    });

    _this.locale.btnZoomOut.addEventListener('click', function(){
        let z = _this.map.getZoom() - 1;
        _this.map.setZoom(z);
        chkZoomBtn(z);
    });

    // Map state functions
    _this.map.on('movestart', function () {
        viewChangeStart();
    });

    _this.map.on('resize', function(){
        helper.debounce(viewChangeStart, 100);
    });

    function viewChangeStart() {
        Object.keys(_this.locale.layers).map(function (layer) {
            _this.locale.layers[layer] = _this.locale.layers[layer] === true ?
                false : _this.locale.layers[layer];
        });
        
        
        Object.keys(_this.vector.layers).map(function(_key){
            if(_this.vector.layers[_key].xhr) _this.vector.layers[_key].xhr.abort();
            if(_this.vector.layers[_key].layer) _this.map.removeLayer(_this.vector.layers[_key].layer);
        });
        //if (_this.vector && _this.vector.xhr) _this.vector.xhr.abort();
        //if (_this.vector && _this.vector.layer) _this.map.removeLayer(_this.vector.layer);
        if (_this.location && _this.location.xhr) _this.location.xhr.abort();
        if (_this.location && _this.location.layer) _this.map.removeLayer(_this.location.layer);
        if (_this.grid && _this.grid.xhr) _this.grid.xhr.abort();
        if (_this.grid && _this.grid.layer) _this.map.removeLayer(_this.grid.layer);
    }

    _this.map.on('moveend', function () {
        viewChangeEnd();
    });

    _this.map.on('zoomend', function(){
        viewChangeEnd();
    });

    let timer;
    function viewChangeEnd() {
        clearTimeout(timer);
        timer = setTimeout(function () {
            let z = _this.map.getZoom();
            chkZoomBtn(z);

            //Set the view hook.
            _this.setViewHook(_this.map.getCenter());

            // Display layerBorder if zoom is more than 10.
            if (_this.countries[_this.country].border) {
                z > 10 ? _this.map.removeLayer(_this.layerBorder) : _this.map.addLayer(_this.layerBorder);
            }
            
            layersCheck('border', true);

            // Get layer.
            _this.vector.getLayers();
            //if (_this.vector && _this.vector.display) _this.vector.getLayer();
            //if (_this.location && _this.location.display) _this.location.getLayer();
            if (_this.grid && _this.grid.display) _this.grid.getLayer();

        }, 100);
    }

    // Pane definitions
    //_this.map.createPane('vector');
    //_this.map.getPane('vector').style.zIndex = 500;

    _this.map.createPane('vectorSelection');
    _this.map.getPane('vectorSelection').style.zIndex = 510;

    _this.map.createPane('locationSelection');
    _this.map.getPane('locationSelection').style.zIndex = 550;
    _this.map.getPane('locationSelection').style.pointerEvents = 'none';

    _this.map.createPane('labels');
    _this.map.getPane('labels').style.zIndex = 550;
    _this.map.getPane('labels').style.pointerEvents = 'none';

    // Panes for vector layers
    _this.map.createPane("areas");
    _this.map.getPane("areas").style.zIndex = 500;
    
    _this.map.createPane("bounds");
    _this.map.getPane("bounds").style.zIndex = 510;
    
    _this.map.createPane("places");
    _this.map.getPane("places").style.zIndex = 530;
    
    _this.map.createPane('location');
    _this.map.getPane('location').style.zIndex = 540;
    _this.map.getPane('location').style.pointerEvents = 'none';
    
    _this.map.createPane('grid');
    _this.map.getPane('grid').style.zIndex = 520;
    _this.map.getPane('grid').style.pointerEvents = 'none';

    // Add base layers
    // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png')
    //     .addTo(_this.map)
    //     .on('load', function () {
    //     layersCheck('base', true);
    // });

    L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token)
        .addTo(_this.map)
        .on('load', function () {
            layersCheck('base', true);
        });

    // L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_only_labels/{z}/{x}/{y}.png', { pane: 'labels' })
    //     .addTo(_this.map)
    //     .on('load', function () { layersCheck('label', true) });

    L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token, { pane: 'labels' })
        .addTo(_this.map)
        .on('load', function () { layersCheck('label', true) });

    // Change country function
    function changeCountry() {
        _this.setHook('country', _this.country);
        // _this.gazetteer.country.textContent = _this.country;
        _this.gazetteer.country.innerHTML = _this.country === 'Global'? '<i class="material-icons">language</i>': _this.country;
        _this.countries[_this.country].border ?
            drawCountryBorder(!_this.hooks.z) : setView(true);

        if (_this.locale.gazetteer) _this.locale.gazetteer();
        if (_this.locale.vector) _this.locale.vector(true);
        //if (_this.locale.location) _this.locale.location(true);
        if (_this.locale.grid) _this.locale.grid(true);
        if (_this.locale.drivetime) _this.locale.drivetime(true);
    }

    // Get and draw country border; Zoom to country border if hooks.z doesn't exist.
    _this.countries[_this.country].border ?
        drawCountryBorder(!_this.hooks.z) : setView(!_this.hooks.z);
    function drawCountryBorder(fit) {
        
        let tile_options = {
            rendererFactory: L.canvas.tile,
            interactive: false,
            zIndex: 1,
            vectorTileLayerStyles: {
                'border': {
                    color: '#96897B',
                    weight: 1,
                    opacity: 0.7,
                    fill: false
                }
            }
        }
        
        let url = localhost + 'mvt_borders/{z}/{x}/{y}'
        + "?" + helper.paramString({
            table: "borders",
            layer: "border",
            country: _this.country
        });
        
        _this.layerBorder = L.vectorGrid.protobuf(url, tile_options)
            .on('load', function(){
                layersCheck('border', true);
            })
            .addTo(_this.map);
        
        setView(fit);
    }

    function setView(fit) {
        // Set max bounds from country extent.
        _this.map.setMaxBounds(_this.countries[_this.country].bounds);
        _this.map.setMinZoom(_this.countries[_this.country].minZoom);
        _this.map.setMaxZoom(_this.countries[_this.country].maxZoom);
        if (fit) _this.map.fitBounds(_this.countries[_this.country].bounds);
    }

    _this.locale.layersCheck = layersCheck;
    
    function layersCheck(layer, ready) {

        // Set the status of layer in locale.layers object.
        _this.locale.layers[layer] = ready;

        // check is the number of layers which are not true
        let check = 0;
        Object.keys(_this.locale.layers).map(function (layer) {
            check += _this.locale.layers[layer] === false ? 1 : 0;
        });

        // Logs when all layers are ready. 
        if(check === 0) setTimeout(function(){
            console.log('layers loaded');
        }, 600);
    }
};