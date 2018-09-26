import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

import token from './token.mjs';

import hooks from './hooks.mjs';

import mobile_interface from './mobile_interface.mjs';

import desktop_interface from './desktop_interface.mjs';

import locales from './locales.mjs';

import L from 'leaflet';

import layers from './layers.mjs';

token(init);

function init() {
 
    // Set platform specific interface functions.
    if (_xyz.ws.view_mode === 'mobile') mobile_interface();
    if (_xyz.ws.view_mode === 'desktop') desktop_interface();

    // Initiate hooks module.
    hooks();

    // Initiate locales module.
    locales();

    // Initiate map object.
    _xyz.ws.map = L
        .map('Map', {
            renderer: L.svg(),
            scrollWheelZoom: true,
            zoomControl: false,
            attributionControl: false,
            minZoom: _xyz.ws.locales[_xyz.ws.locale].minZoom,
            maxZoom: _xyz.ws.locales[_xyz.ws.locale].maxZoom
        })
        .setView([parseFloat(_xyz.ws.hooks.lat || 0), parseFloat(_xyz.ws.hooks.lng || 0)], parseInt(_xyz.ws.hooks.z || 15));

    // Set view and bounds; Zoom to extent of bounds if no hooks.z is present.
    _xyz.ws.setView = fit => {
        _xyz.ws.map.setMaxBounds(_xyz.ws.locales[_xyz.ws.locale].bounds || [[-90, -180], [90, 180]]);
        _xyz.ws.map.setMinZoom(_xyz.ws.locales[_xyz.ws.locale].minZoom);
        _xyz.ws.map.setMaxZoom(_xyz.ws.locales[_xyz.ws.locale].maxZoom);
        if (fit) _xyz.ws.map.fitBounds(_xyz.ws.locales[_xyz.ws.locale].bounds || [[-90, -180], [90, 180]]);
    }
    _xyz.ws.setView(!_xyz.ws.hooks.z);

    // Zoom functions
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');

    chkZoomBtn(_xyz.ws.map.getZoom());
    function chkZoomBtn(z) {
        btnZoomIn.disabled = z < _xyz.ws.locales[_xyz.ws.locale].maxZoom ? false : true;
        btnZoomOut.disabled = z > _xyz.ws.locales[_xyz.ws.locale].minZoom ? false : true;
    }

    btnZoomIn.addEventListener('click', () => {
        let z = _xyz.ws.map.getZoom() + 1;
        _xyz.ws.map.setZoom(z);
        chkZoomBtn(z);
    });

    btnZoomOut.addEventListener('click', () => {
        let z = _xyz.ws.map.getZoom() - 1;
        _xyz.ws.map.setZoom(z);
        chkZoomBtn(z);
    });

    // Map view state functions
    _xyz.ws.map.on('movestart', () => {
        viewChangeStart();
    });

    _xyz.ws.map.on('resize', () => {
        utils.debounce(viewChangeStart, 100);
    });

    // Cancel xhr and remove layer data from map object on view change start.
    function viewChangeStart() {
        let layers = _xyz.ws.locales[_xyz.ws.locale].layers;
        Object.keys(layers).forEach(layer => {
            if (layers[layer].xhr) layers[layer].xhr.abort();
            if (layers[layer].L) _xyz.ws.map.removeLayer(layers[layer].L);
        });
    }

    // Fire viewChangeEnd after map move and zoomend
    _xyz.ws.map.on('moveend', () => {
        viewChangeEnd();
    });
    _xyz.ws.map.on('zoomend', () => {
        viewChangeEnd();
    });

    // Use timeout to prevent the viewChangeEvent to be executed multiple times.
    let timer;
    function viewChangeEnd() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            chkZoomBtn(_xyz.ws.map.getZoom());

            _xyz.ws.setViewHook(_xyz.ws.map.getCenter());

            // Reset the load inidicator and trigger get layer on all layers.
            Object.values(_xyz.ws.locales[_xyz.ws.locale].layers).forEach(layer => {
                if (layer.loader) layer.loader.style.display = 'none';
                if(layer.getLayer) layer.getLayer(_xyz.ws);  
            });

        }, 100);
    }

    // Function to check whether all display layers are drawn.
    _xyz.ws.layersCheck = () => {
        let layersArray = [],
            chkScore = 0;

        Object.values(_xyz.ws.locales[_xyz.ws.locale].layers).forEach(layer => {
            chkScore = layer.display ? chkScore++ : chkScore;
            chkScore = layer.display && layer.loaded ? chkScore-- : chkScore;
            layersArray.push([layer.name, layer.display, layer.loaded]);
        });
    }

    // Initialize layers module.
    layers();

    // // Initialize locations module.
    // require('./locations')();

    // // Initialize gazetteer module.
    // if (_xyz.ws.view_mode != 'report') require('./gazetteer')();

    // // Initialize locate module.
    // if (_xyz.ws.locate && _xyz.ws.view_mode != 'report') require('./locate')();

    // // Initialize report module.
    // if (_xyz.ws.report) require('./report')();

    // document.getElementById('btnLogin').addEventListener('click', () => {
    //     window.location = document.head.dataset.dir + '/login?redirect=' + (document.head.dataset.dir || '/') + window.location.search;
    // });

}