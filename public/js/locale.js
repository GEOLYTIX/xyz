const L = require('leaflet');
const helper = require('./helper');

module.exports = function(_){

    let dom = {
        'btnZoomIn': document.getElementById('btnZoomIn'),
        'btnZoomOut': document.getElementById('btnZoomOut'),
        'country': document.getElementById('gaz_country'),
        'countrylist': document.getElementById('gaz_countrylist')
    };

    // Get list of country keys and assign to country drop down.
    let countries = '';
    for (let key in _.countries) {
        if (_.countries.hasOwnProperty(key)) countries += '<li data-country="'+ key +'">' + _.countries[key].name + '</li>';
    }
    dom.countrylist.innerHTML = countries;

    if (Object.keys(_.countries).length > 1) {
        helper.addClass(dom.country, 'active');

        // Add click event to toggle country drop down display.
        dom.country.addEventListener('click', function () {
            dom.countrylist.style.display = dom.countrylist.style.display === 'block' ? 'none' : 'block';
        });

        // Add click event to the countries in drop down.
        let items = dom.countrylist.querySelectorAll('li');
        Object.keys(items).map(function (key) {
            items[key].addEventListener('click', function () {
                dom.countrylist.style.display = 'none';
                _.country = this.dataset.country;
                changeCountry();
            })
        });
    }
    

    // Set country to hook, or set hook for country.
    if (_.hooks.country) {
        _.country = _.hooks.country;
    } else {
        _.setHook('country', _.country);
    }

    // Set country text in the Gazetteer box.
    dom.country.innerHTML = _.country === 'Global'? '<i class="material-icons">language</i>': _.country;

    // Initiate map object.
    _.map = L.map('map', {
        renderer: L.svg(),
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        minZoom: _.countries[_.country].minZoom,
        maxZoom: _.countries[_.country].maxZoom
    }).setView([parseFloat(_.hooks.lat || 0), parseFloat(_.hooks.lng || 0)], parseInt(_.hooks.z || 15));
    chkZoomBtn(_.map.getZoom());

    // Zoom functions
    function chkZoomBtn(z){
        dom.btnZoomIn.disabled = z < _.countries[_.country].maxZoom ?  false : true;
        dom.btnZoomOut.disabled = z > _.countries[_.country].minZoom ? false : true;
    }

    dom.btnZoomIn.addEventListener('click', function () {
        let z = _.map.getZoom() + 1;
        _.map.setZoom(z);
        chkZoomBtn(z);
    });

    dom.btnZoomOut.addEventListener('click', function(){
        let z = _.map.getZoom() - 1;
        _.map.setZoom(z);
        chkZoomBtn(z);
    });

    // Map state functions
    _.map.on('movestart', function () {
        viewChangeStart();
    });

    _.map.on('resize', function(){
        helper.debounce(viewChangeStart, 100);
    });

    function viewChangeStart() {
        // Object.keys(_.locale.layers).map(function (layer) {
        //     _.locale.layers[layer] = _.locale.layers[layer] === true ?
        //         false : _.locale.layers[layer];
        // });
        
        
        // Object.keys(_.layers.layers).map(function(_key){
        //     if(_.layers.layers[_key].xhr) _.layers.layers[_key].xhr.abort();
        //     if(_.layers.layers[_key].layer) _.map.removeLayer(_.layers.layers[_key].layer);
        // });
        // //if (_.layers && _.layers.xhr) _.layers.xhr.abort();
        // //if (_.layers && _.layers.layer) _.map.removeLayer(_.layers.layer);
        // if (_.location && _.location.xhr) _.location.xhr.abort();
        // if (_.location && _.location.layer) _.map.removeLayer(_.location.layer);
        // if (_.grid && _.grid.xhr) _.grid.xhr.abort();
        // if (_.grid && _.grid.layer) _.map.removeLayer(_.grid.layer);
    }

    _.map.on('moveend', function () {
        viewChangeEnd();
    });

    _.map.on('zoomend', function(){
        viewChangeEnd();
    });

    let timer;
    function viewChangeEnd() {
        clearTimeout(timer);
        timer = setTimeout(function () {
            let z = _.map.getZoom();
            chkZoomBtn(z);

            //Set the view hook.
            _.setViewHook(_.map.getCenter());
           
            //layersCheck('border', true);

            // Get layer.
            //_.layers.getLayers();
            //if (_.layers && _.layers.display) _.layers.getLayer();
            //if (_.location && _.location.display) _.location.getLayer();
            //if (_.grid && _.grid.display) _.grid.getLayer();

        }, 100);
    }

    // Pane definitions
    //_.map.createPane('vector');
    //_.map.getPane('vector').style.zIndex = 500;

    _.map.createPane('vectorSelection');
    _.map.getPane('vectorSelection').style.zIndex = 510;

    _.map.createPane('locationSelection');
    _.map.getPane('locationSelection').style.zIndex = 550;
    _.map.getPane('locationSelection').style.pointerEvents = 'none';

    _.map.createPane('shadowFilter');
    _.map.getPane('shadowFilter').style.zIndex = 540;
    _.map.getPane('shadowFilter').style.pointerEvents = 'none';

    _.map.createPane('labels');
    _.map.getPane('labels').style.zIndex = 550;
    _.map.getPane('labels').style.pointerEvents = 'none';

    // Panes for vector layers
    _.map.createPane("areas");
    _.map.getPane("areas").style.zIndex = 500;
    
    _.map.createPane("bounds");
    _.map.getPane("bounds").style.zIndex = 510;
    
    _.map.createPane("places");
    _.map.getPane("places").style.zIndex = 530;
    
    _.map.createPane('location');
    _.map.getPane('location').style.zIndex = 540;
    _.map.getPane('location').style.pointerEvents = 'none';
    
    _.map.createPane('grid');
    _.map.getPane('grid').style.zIndex = 520;
    _.map.getPane('grid').style.pointerEvents = 'none';

    // Add base layers
    L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token)
        .addTo(_.map)
        .on('load', function () {
            layersCheck('base', true);
        });

    L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token, { pane: 'labels' })
        .addTo(_.map)
        .on('load', function () { layersCheck('label', true) });

    // Change country function
    function changeCountry() {
        _.setHook('country', _.country);
        dom.country.innerHTML = _.country === 'Global'? '<i class="material-icons">language</i>': _.country;
        
        setView(true);

        if (_.locale.gazetteer) _.locale.gazetteer();
        if (_.locale.layers) _.locale.layers(true);
        if (_.locale.grid) _.locale.grid(true);
        if (_.locale.drivetime) _.locale.drivetime(true);
    }

    setView(!_.hooks.z);
    function setView(fit) {
        // Set max bounds from country extent.
        _.map.setMaxBounds(_.countries[_.country].bounds);
        _.map.setMinZoom(_.countries[_.country].minZoom);
        _.map.setMaxZoom(_.countries[_.country].maxZoom);
        if (fit) _.map.fitBounds(_.countries[_.country].bounds);
    }


    _.locale.layersCheck = layersCheck;
    
    function layersCheck(layer, ready) {

        // Set the status of layer in locale.layers object.
        _.locale.layers[layer] = ready;

        // check is the number of layers which are not true
        let check = 0;
        Object.keys(_.locale.layers).map(function (layer) {
            check += _.locale.layers[layer] === false ? 1 : 0;
        });

        // Logs when all layers are ready. 
        if(check === 0) setTimeout(function(){
            console.log('layers loaded');
        }, 600);
    }
};