// The svg_symbols module is required in order to build svg symbols when they are evaluated in _xyz application settings.
const svg_symbols = require('./svg_symbols');

// Evaluates _xyz application settings.
(function objectEval(_xyz) {
    Object.keys(_xyz).map(function (key) {
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

// All mobile interface quirks are loaded here.
if (view_mode === 'mobile') require('./mobile_interface')();

// Initialise utils.
const utils = require('./utils');

// All mobile interface quirks are loaded here.
if (node_env === 'development') {
    let dev_elements = document.querySelectorAll('.dev');
    utils.removeClass(dev_elements,'dev_display');
};

// Initiate leaflet and hooks.
const L = require('leaflet');
require('./hooks')();

// Initiate dom object.
let dom = {
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut')
};

// Set country default.
_xyz.country = _xyz.country || Object.keys(_xyz.countries)[0];

// Set country to hook, or set hook for country.
if (_xyz.hooks.country) {
    _xyz.country = _xyz.hooks.country;
} else {
    _xyz.setHook('country', _xyz.country);
}

// Set min/max zoom defaults.
_xyz.countries[_xyz.country].minZoom = _xyz.countries[_xyz.country].minZoom || 0;
_xyz.countries[_xyz.country].maxZoom = _xyz.countries[_xyz.country].maxZoom || 20;

// Initiate map object.
_xyz.map = L
    .map('map', {
        renderer: L.svg(),
        scrollWheelZoom: true,
        zoomControl: false,
        attributionControl: false,
        minZoom: _xyz.countries[_xyz.country].minZoom,
        maxZoom: _xyz.countries[_xyz.country].maxZoom
    })
    .setView([parseFloat(_xyz.hooks.lat || 0), parseFloat(_xyz.hooks.lng || 0)], parseInt(_xyz.hooks.z || 15));

// Set view and bounds; Zoom to extent of bounds if no hooks.z is present.
_xyz.setView = function(fit) {
    if (_xyz.countries[_xyz.country].bounds) _xyz.map.setMaxBounds(_xyz.countries[_xyz.country].bounds);
    _xyz.map.setMinZoom(_xyz.countries[_xyz.country].minZoom);
    _xyz.map.setMaxZoom(_xyz.countries[_xyz.country].maxZoom);
    if (fit) _xyz.map.fitBounds(_xyz.countries[_xyz.country].bounds || [[-90,-180],[90,180]]);
}
_xyz.setView(!_xyz.hooks.z);

// Zoom functions
chkZoomBtn(_xyz.map.getZoom());
function chkZoomBtn(z){
    dom.btnZoomIn.disabled = z < _xyz.countries[_xyz.country].maxZoom ?  false : true;
    dom.btnZoomOut.disabled = z > _xyz.countries[_xyz.country].minZoom ? false : true;
}

dom.btnZoomIn.addEventListener('click', function () {
    let z = _xyz.map.getZoom() + 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

dom.btnZoomOut.addEventListener('click', function(){
    let z = _xyz.map.getZoom() - 1;
    _xyz.map.setZoom(z);
    chkZoomBtn(z);
});

// Map state functions
_xyz.map.on('movestart', function () {
    viewChangeStart();
});

_xyz.map.on('resize', function(){
    utils.debounce(viewChangeStart, 100);
});

function viewChangeStart() {
    let layers = _xyz.countries[_xyz.country].layers
    Object.keys(layers).map(function (layer) {
        if(layers[layer].xhr) layers[layer].xhr.abort();
        if(layers[layer].L) _xyz.map.removeLayer(layers[layer].L);
    });
}

_xyz.map.on('moveend', function () {
    viewChangeEnd();
});

_xyz.map.on('zoomend', function(){
    viewChangeEnd();
});

let timer;
function viewChangeEnd() {
    clearTimeout(timer);
    timer = setTimeout(function () {
        let z = _xyz.map.getZoom();
        chkZoomBtn(z);

        //Set the view hook.
        _xyz.setViewHook(_xyz.map.getCenter());

        let layers = _xyz.countries[_xyz.country].layers
        Object.keys(layers).map(function (layer) {
            if (layers[layer].loader) layers[layer].loader.style.display = 'none';
            layers[layer].getLayer();
        });
    }, 100);
}

// Function to check whether all display layers are drawn.
_xyz.layersCheck = layersCheck;
function layersCheck() {
    let layers = _xyz.countries[_xyz.country].layers,
        chkScore = 0;

    let layersArray = [];

    Object.keys(layers).map(function (layer) {
        chkScore = layers[layer].display ? chkScore++ : chkScore;
        chkScore = layers[layer].display &&  layers[layer].loaded ? chkScore-- : chkScore;

        layersArray.push([layers[layer].name, layers[layer].display, layers[layer].loaded]);
    });

    // Logs when all layers are ready. 
    if(chkScore === 0) console.log(layersArray);
}

// Inititialise modules.
if (_xyz.gazetteer) require('./gazetteer')(_xyz);
require('./layers')(_xyz);
if (_xyz.select) require('./select')(_xyz);
if (_xyz.catchments) require('./catchments')(_xyz);
if (_xyz.report) require('./report')(_xyz);

// Make blocks visible and set scrollbar left for desktop view.
if (view_mode === 'desktop') require('./lscrolly')(document.querySelector('.module_container'));