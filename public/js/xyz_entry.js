// Initialise utils.
const utils = require('./utils');

// The svg_symbols module is required in order to build svg symbols when they are evaluated in _xyz application settings.
const svg_symbols = require('./svg_symbols');

// Evaluates _xyz application settings.
(function objectEval(_xyz) {
    Object.keys(_xyz).map(key => {
        if (typeof _xyz[key] === 'string') {
            try {
                let tmp = eval(_xyz[key]);
                _xyz[key] = typeof tmp != 'undefined'? tmp: _xyz[key];
            }
            catch(me){
                //console.log(me);
            }
        }
        if (_xyz[key] && typeof _xyz[key] === 'object') objectEval(_xyz[key]);
    })
})(_xyz)

// Set platform specific interface functions.
if (view_mode === 'mobile') require('./mobile_interface')();
if (view_mode === 'desktop') require('./desktop_interface')();

// Initiate hooks module.
require('./hooks')();

// Initiate locales module.
require('./locales')();

// Initiate leaflet.
const L = require('leaflet');

// Initiate map object.
_xyz.map = L
    .map('Map', {
        renderer: L.svg(),
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        minZoom: _xyz.locales[_xyz.locale].minZoom,
        maxZoom: _xyz.locales[_xyz.locale].maxZoom
    })
    .setView([parseFloat(_xyz.hooks.lat || 0), parseFloat(_xyz.hooks.lng || 0)], parseInt(_xyz.hooks.z || 15));

// Set view and bounds; Zoom to extent of bounds if no hooks.z is present.
_xyz.setView = fit => {
    _xyz.map.setMaxBounds(_xyz.locales[_xyz.locale].bounds || [[-90,-180],[90,180]]);
    _xyz.map.setMinZoom(_xyz.locales[_xyz.locale].minZoom);
    _xyz.map.setMaxZoom(_xyz.locales[_xyz.locale].maxZoom);
    if (fit) _xyz.map.fitBounds(_xyz.locales[_xyz.locale].bounds || [[-90,-180],[90,180]]);
}
_xyz.setView(!_xyz.hooks.z);

// Zoom functions
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');

chkZoomBtn(_xyz.map.getZoom());
function chkZoomBtn(z){
    btnZoomIn.disabled = z < _xyz.locales[_xyz.locale].maxZoom ?  false : true;
    btnZoomOut.disabled = z > _xyz.locales[_xyz.locale].minZoom ? false : true;
}

btnZoomIn.addEventListener('click', () => {
    let z = _xyz.map.getZoom() + 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

btnZoomOut.addEventListener('click', () => {
    let z = _xyz.map.getZoom() - 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

// Map view state functions
_xyz.map.on('movestart', () => {
    viewChangeStart();
});

_xyz.map.on('resize', () => {
    utils.debounce(viewChangeStart, 100);
});

// Cancel xhr and remove layer data from map object on view change start.
function viewChangeStart() {
    let layers = _xyz.locales[_xyz.locale].layers
    Object.keys(layers).forEach(layer => {
        if(layers[layer].xhr) layers[layer].xhr.abort();
        if(layers[layer].L) _xyz.map.removeLayer(layers[layer].L);
    });
}

// Fire viewChangeEnd after map move and zoomend
_xyz.map.on('moveend', () => {
    viewChangeEnd();
});
_xyz.map.on('zoomend', () => {
    viewChangeEnd();
});

// Use timeout to prevent the viewChangeEvent to be executed multiple times.
let timer;
function viewChangeEnd() {
    clearTimeout(timer);
    timer = setTimeout(() => {
        chkZoomBtn(_xyz.map.getZoom());

        _xyz.setViewHook(_xyz.map.getCenter());

        // Reset the load inidicator and trigger get layer on all layers.
        Object.values(_xyz.locales[_xyz.locale].layers).forEach(layer => {
            if (layer.loader) layer.loader.style.display = 'none';
            layer.getLayer();
        });
    }, 100);
}

// Function to check whether all display layers are drawn.
_xyz.layersCheck = () => {
    let layersArray = [],
        chkScore = 0;

    Object.values(_xyz.locales[_xyz.locale].layers).forEach(layer => {
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
if (_xyz.gazetteer && view_mode != 'report') require('./gazetteer')();

// Initialize locate module.
if (_xyz.locate) require('./locate')();

// Initialize report module.
if (_xyz.report) require('./report')();