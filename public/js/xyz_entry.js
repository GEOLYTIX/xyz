require('./workspace')(init);

function init() {

    // Initialise utils.
    const utils = require('./utils');

    // Set platform specific interface functions.
    if (global._xyz.view_mode === 'mobile') require('./mobile_interface')();
    if (global._xyz.view_mode === 'desktop') require('./desktop_interface')();

    // Initiate hooks module.
    require('./hooks')();

    // Initiate locales module.
    require('./locales')();

    // Initiate leaflet.
    const L = require('leaflet');

    // Initiate map object.
    global._xyz.map = L
        .map('Map', {
            renderer: L.svg(),
            scrollWheelZoom: true,
            zoomControl: false,
            attributionControl: false,
            minZoom: global._xyz.locales[global._xyz.locale].minZoom,
            maxZoom: global._xyz.locales[global._xyz.locale].maxZoom
        })
        .setView([parseFloat(global._xyz.hooks.lat || 0), parseFloat(global._xyz.hooks.lng || 0)], parseInt(global._xyz.hooks.z || 15));

    // Set view and bounds; Zoom to extent of bounds if no hooks.z is present.
    global._xyz.setView = fit => {
        global._xyz.map.setMaxBounds(global._xyz.locales[global._xyz.locale].bounds || [[-90, -180], [90, 180]]);
        global._xyz.map.setMinZoom(global._xyz.locales[global._xyz.locale].minZoom);
        global._xyz.map.setMaxZoom(global._xyz.locales[global._xyz.locale].maxZoom);
        if (fit) global._xyz.map.fitBounds(global._xyz.locales[global._xyz.locale].bounds || [[-90, -180], [90, 180]]);
    }
    global._xyz.setView(!global._xyz.hooks.z);

    // Zoom functions
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');

    chkZoomBtn(global._xyz.map.getZoom());
    function chkZoomBtn(z) {
        btnZoomIn.disabled = z < global._xyz.locales[global._xyz.locale].maxZoom ? false : true;
        btnZoomOut.disabled = z > global._xyz.locales[global._xyz.locale].minZoom ? false : true;
    }

    btnZoomIn.addEventListener('click', () => {
        let z = global._xyz.map.getZoom() + 1;
        global._xyz.map.setZoom(z);
        chkZoomBtn(z);
    });

    btnZoomOut.addEventListener('click', () => {
        let z = global._xyz.map.getZoom() - 1;
        global._xyz.map.setZoom(z);
        chkZoomBtn(z);
    });

    // Map view state functions
    global._xyz.map.on('movestart', () => {
        viewChangeStart();
    });

    global._xyz.map.on('resize', () => {
        utils.debounce(viewChangeStart, 100);
    });

    // Cancel xhr and remove layer data from map object on view change start.
    function viewChangeStart() {
        let layers = global._xyz.locales[global._xyz.locale].layers
        Object.keys(layers).forEach(layer => {
            if (layers[layer].xhr) layers[layer].xhr.abort();
            if (layers[layer].L) global._xyz.map.removeLayer(layers[layer].L);
        });
    }

    // Fire viewChangeEnd after map move and zoomend
    global._xyz.map.on('moveend', () => {
        viewChangeEnd();
    });
    global._xyz.map.on('zoomend', () => {
        viewChangeEnd();
    });

    // Use timeout to prevent the viewChangeEvent to be executed multiple times.
    let timer;
    function viewChangeEnd() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            chkZoomBtn(global._xyz.map.getZoom());

            global._xyz.setViewHook(global._xyz.map.getCenter());

            // Reset the load inidicator and trigger get layer on all layers.
            Object.values(global._xyz.locales[global._xyz.locale].layers).forEach(layer => {
                if (layer.loader) layer.loader.style.display = 'none';
                layer.getLayer(global._xyz);
            });
        }, 100);
    }

    // Function to check whether all display layers are drawn.
    global._xyz.layersCheck = () => {
        let layersArray = [],
            chkScore = 0;

        Object.values(global._xyz.locales[global._xyz.locale].layers).forEach(layer => {
            chkScore = layer.display ? chkScore++ : chkScore;
            chkScore = layer.display && layer.loaded ? chkScore-- : chkScore;
            layersArray.push([layer.name, layer.display, layer.loaded]);
        });
    }

    // Initialize layers module.
    require('./layers')();

    // Initialize locations module.
    require('./locations')();

    // Initialize gazetteer module.
    if (global._xyz.view_mode != 'report') require('./gazetteer')();

    // Initialize locate module.
    if (global._xyz.locate && global._xyz.view_mode != 'report') require('./locate')();

    // Initialize report module.
    if (global._xyz.report) require('./report')();

}