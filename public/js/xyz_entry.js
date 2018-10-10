import _xyz from './_xyz.mjs';

import token from './token.mjs';

import mobile from './views/mobile.mjs';

import desktop from './views/desktop.mjs';

import hooks from './hooks.mjs';

import locales from './locales.mjs';

import L from 'leaflet';

import layers from './layer/_layers.mjs';
_xyz.initLayers = layers;

import locations from './location/_locations.mjs';

import locate from './locate.mjs';

import gazetteer from './gazetteer.mjs';

_xyz.log = document.body.dataset.log ? true : null;
_xyz.nanoid = document.body.dataset.nanoid;
_xyz.view_mode = document.body.dataset.viewmode;
_xyz.host = document.head.dataset.dir;

token(init);

function init() {
 
  // Set platform specific interface functions.
  if (_xyz.view_mode === 'mobile') mobile();
  if (_xyz.view_mode === 'desktop') desktop();

  // Initiate hooks module.
  hooks();

  // Initiate locales module.
  locales();

  // Initiate map object.
  _xyz.map = L
    .map('Map', {
      renderer: L.svg(),
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
      minZoom: _xyz.ws.locales[_xyz.locale].minZoom,
      maxZoom: _xyz.ws.locales[_xyz.locale].maxZoom
    })
    .setView([parseFloat(_xyz.hooks.lat || 0), parseFloat(_xyz.hooks.lng || 0)], parseInt(_xyz.hooks.z || 15));

  // Set view and bounds;
  _xyz.setView = fit => {

    _xyz.map.setMaxBounds(_xyz.ws.locales[_xyz.locale].bounds.leaflet);
    _xyz.map.setMinZoom(_xyz.ws.locales[_xyz.locale].minZoom);
    _xyz.map.setMaxZoom(_xyz.ws.locales[_xyz.locale].maxZoom);

    // Fit view to bounds of locale if fit is true.
    if (fit) _xyz.map.fitBounds(_xyz.ws.locales[_xyz.locale].bounds.leaflet);
  };

  // Set the map view; fit is true for !hooks.z
  _xyz.setView(!_xyz.hooks.z);

  // Zoom functions
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');

  chkZoomBtn(_xyz.map.getZoom());

  // Disable zoom button at max/min zoom for locale.
  function chkZoomBtn(z) {
    btnZoomIn.disabled = z < _xyz.ws.locales[_xyz.locale].maxZoom ? false : true;
    btnZoomOut.disabled = z > _xyz.ws.locales[_xyz.locale].minZoom ? false : true;
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
    _xyz.utils.debounce(viewChangeStart, 100);
  });

  // Cancel xhr and remove layer data from map object on view change start.
  function viewChangeStart() {

    // Iterate through layers; Abort xhr and remove layer from map.
    Object.values(_xyz.layers).forEach(layer => {
      if (layer.xhr) layer.xhr.abort();
      if (layer.L) _xyz.map.removeLayer(layer.L);
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
      _xyz.utils.setViewHook(_xyz.map.getCenter());

      // Iterate through layers; Hide layer load indicator and attempt layer reload.
      Object.values(_xyz.layers).forEach(layer => {
        if (layer.loader) layer.loader.style.display = 'none';
        if (layer.get) layer.get();  
      });
    }, 100);
  }

  // Function to check the map attribution.
  function attributionCheck() {

    // Get attribution links and check whether the className is in the attribution list.
    let links = document.querySelectorAll('.attribution > .links > a');

    for (let i = 0; i < links.length; ++i) {
      links[i].style.display = _xyz.attribution.indexOf(links[i].className) >= 0 ? 'inline-block' : 'none';
    }
  }

  // Function to check whether all display layers are drawn.
  _xyz.layersCheck = () => {

    // Set default attribution.
    _xyz.attribution = ['leaflet', 'xyz'];

    let layersArray = [],
      chkScore = 0;

    Object.values(_xyz.layers).forEach(layer => {

      // Add attribution to array if layer is visible.
      if (layer.attribution && layer.display) _xyz.attribution = _xyz.attribution.concat(layer.attribution || []);
  
      chkScore = layer.display ? chkScore++ : chkScore;
      chkScore = layer.display && layer.loaded ? chkScore-- : chkScore;
      layersArray.push([layer.key, layer.display, layer.loaded]);
    });

    attributionCheck();
  };

  // Initialize layers.
  _xyz.initLayers();

  // Initialize locations module.
  locations();

  // Initialize gazetteer module.
  if (_xyz.view_mode != 'report') gazetteer();

  // Initialize locate module.
  if (_xyz.ws.locate && _xyz.view_mode != 'report') locate();

  // Initialize report module.
  // if (_xyz.ws.report) report();

  // Add redirect to login button click event.
  document.getElementById('btnLogin').addEventListener('click', () => {
    window.location = document.head.dataset.dir + '/login?redirect=' + (document.head.dataset.dir || '/') + window.location.search;
  });

}