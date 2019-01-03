// import idx from './index.mjs';


// window.__xyz = (function () { return idx; })();


// (function () { window.__xyz = idx; })();


// window.__xyz = idx;

// import _xyz from '../_xyz.mjs';

import L from 'leaflet';

// _xyz.L = L;

window.__xyz = class App {

  constructor(params) {
    this.map = L.map(params.map_id, {
      renderer: L.svg(),
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.setView([ params.view_lat, params.view_lng ], 15);

  }

};