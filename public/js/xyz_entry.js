// Evaluate view_mode.
if (view_mode === 'mobile') require('./mobile_interface')();

// Evaluate _xyz.
const svg_symbols = require('./svg_symbols');
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

// Initiate leaflet, utils and hooks.
const L = require('leaflet');
const utils = require('./utils');
require('./hooks')();

// Initiate dom object.
let dom = {
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut')
};

// Set country to hook, or set hook for country.
if (_xyz.hooks.country) {
    _xyz.country = _xyz.hooks.country;
} else {
    _xyz.setHook('country', _xyz.country);
}

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
    _xyz.map.setMaxBounds(_xyz.countries[_xyz.country].bounds);
    _xyz.map.setMinZoom(_xyz.countries[_xyz.country].minZoom);
    _xyz.map.setMaxZoom(_xyz.countries[_xyz.country].maxZoom);
    if (fit) _xyz.map.fitBounds(_xyz.countries[_xyz.country].bounds);
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
        if(layers[layer].l) _xyz.map.removeLayer(layers[layer].l);
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
            if(layers[layer].display) layers[layer].getLayer(_xyz);
        });
    }, 100);
}

// _xyz.map.getPane('areas').style.zIndex = 500;
// _xyz.map.getPane('bounds').style.zIndex = 510;
// _xyz.map.getPane('grid').style.zIndex = 520;
// _xyz.map.getPane('places').style.zIndex = 530;
// _xyz.map.getPane('location').style.zIndex = 540;


// Add base layers
L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/ciozrimi3002bdsm8bjtn2v1y/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token)
    .addTo(_xyz.map)
    .on('load', function () {
        layersCheck();
    });

_xyz.map.createPane('labels');
_xyz.map.getPane('labels').style.zIndex = 550;
_xyz.map.getPane('labels').style.pointerEvents = 'none';

L.tileLayer('https://api.mapbox.com/styles/v1/dbauszus/cj9puo8pr5o0c2sovhdwhkc7z/tiles/256/{z}/{x}/{y}?access_token=' + mapbox_token, { pane: 'labels' })
    .addTo(_xyz.map)
    .on('load', function () { 
        layersCheck();
    });



// Function to check whether all display layers are drawn.
_xyz.layersCheck = layersCheck;
function layersCheck() {
    let layers = _xyz.countries[_xyz.country].layers,
        chkScore = 0;

    Object.keys(layers).map(function (layer) {
        chkScore = layers[layer].display ? chkScore++ : chkScore;
        chkScore = layers[layer].display &&  layers[layer].loaded ? chkScore-- : chkScore;
    });

    // Logs when all layers are ready. 
    if(chkScore === 0) console.log('layers loaded');
}

// Inititialise modules.
if (_xyz.gazetteer) require('./gazetteer')(_xyz);
if (_xyz.layers) require('./layers')(_xyz);
if (_xyz.select) require('./select')(_xyz);
if (_xyz.grid) require('./grid')(_xyz);
if (_xyz.catchments) require('./catchments')(_xyz);

// Load report module in desktop view.
if (view_mode === 'desktop') require('./report')(_xyz);

// Make blocks visible and set scrollbar left for desktop view.
document.querySelector('.module_container').style.display = 'block';
if (view_mode === 'desktop') require('./lscrolly')(document.querySelector('.module_container'));