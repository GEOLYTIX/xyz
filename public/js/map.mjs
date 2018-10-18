import _xyz from './_xyz.mjs';

import L from 'leaflet';

import * as attribution from './attribution.mjs';

import _panes from './panes.mjs';
_xyz.panes = {init: _panes};

export default () => {

  // Initiate map object.
  _xyz.initMap = () => L.map('Map', {
    renderer: L.svg(),
    scrollWheelZoom: true,
    zoomControl: false,
    attributionControl: false,
    minZoom: _xyz.ws.locales[_xyz.locale].minZoom,
    maxZoom: _xyz.ws.locales[_xyz.locale].maxZoom
  });

  _xyz.map = _xyz.initMap();
    
  _xyz.map.setView(
    [parseFloat(_xyz.hooks.current.lat || 0),
      parseFloat(_xyz.hooks.current.lng || 0)],
    parseInt(_xyz.hooks.current.z || 15));

  _xyz.panes.init();

  // Set view and bounds;
  _xyz.view.set = (fit) => {
    _xyz.map.setMaxBounds(_xyz.ws.locales[_xyz.locale].bounds.leaflet);
    _xyz.map.setMinZoom(_xyz.ws.locales[_xyz.locale].minZoom);
    _xyz.map.setMaxZoom(_xyz.ws.locales[_xyz.locale].maxZoom);

    // Fit view to bounds of locale if fit is true.
    if (fit) _xyz.map.fitBounds(_xyz.ws.locales[_xyz.locale].bounds.leaflet);
  };

  // Set the map view; fit is true for !hooks.z
  _xyz.view.set(!_xyz.hooks.current.z);

  // Zoom functions
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');

  // Check whether zoom buttons should be disabled for initial view.
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
  _xyz.map.on('movestart', () => viewChangeStart());
  _xyz.map.on('resize', () => _xyz.utils.debounce(viewChangeStart, 100));

  function viewChangeStart() {

    attribution.remove();

    // Draw a frame of the current map bounding box.
    if (_xyz.frame) _xyz.map.removeLayer(_xyz.frame);
    _xyz.frame = L.rectangle(_xyz.map.getBounds(), {color: '#cf9', fill: false, pane: 'rectangle'}).addTo(_xyz.map);

    // Remove layers from map.
    Object.values(_xyz.layers.list).forEach(layer => {
      if (layer.L) _xyz.map.removeLayer(layer.L);
    });
  }

  // Fire viewChangeEnd after map move and zoomend
  _xyz.map.on('moveend', () => viewChangeEndTimer());
  _xyz.map.on('zoomend', () => viewChangeEndTimer());

  // Use timeout to prevent the viewChangeEvent to be executed multiple times.
  let timer;
  function viewChangeEndTimer() {
    clearTimeout(timer);
    timer = setTimeout(viewChangeEnd, 100);
  }

  function viewChangeEnd() {

    // Remove existing map view frame.
    if (_xyz.frame) _xyz.map.removeLayer(_xyz.frame);

    // Check whether the zoom button should be enabled / disabled.
    chkZoomBtn(_xyz.map.getZoom());

    // Set the hook for the map view.
    _xyz.hooks.setView(_xyz.map.getCenter());

    // Load layer which have display set to true.
    Object.values(_xyz.layers.list).forEach(layer => {
      if (layer.display) {
        layer.loader.style.display = 'block';
        layer.get();
      }
    });
  }

  // Function to check whether all display layers are drawn.
  _xyz.layers.check = layer => {

    // Set layer to loaded and hide the loader.
    if (layer) {
      layer.loaded = true;
      if (layer.loader) layer.loader.style.display = 'none';
      if (_xyz.log) console.log(layer.key + ' loaded.');

      // Attribution
      if (layer.attribution && layer.display) attribution.set(layer.attribution);

    } else {
      attribution.check();
    }
    
    // Determine whether all layers with display true are loaded.
    let chkScore = 0;
    Object.values(_xyz.layers.list).forEach(layer => {
      chkScore += layer.display ? 1 : 0;
      chkScore -= layer.display && layer.loaded ? 1 : 0;
    });

    // Send info signal that all layers are loaded.
    if (_xyz.log && chkScore === 0) console.log('All layers loaded.');

  };

};