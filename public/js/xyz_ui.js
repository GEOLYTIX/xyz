// import _xyz from './xyz_control/index.mjs';

// import logRocket from './logRocket.mjs';

import mobile from '../views/mobile.mjs';

import desktop from '../views/desktop.mjs';

_xyz({
  host: document.head.dataset.dir || new String(''),
  token: document.body.dataset.token,
  log: document.body.dataset.log,
  nanoid: document.body.dataset.nanoid,
  hooks: true,
  callback: init,
});

function init(_xyz) {

  createMap(_xyz);

  // Create locales dropdown if length of locales array is > 1.
  if (Object.keys(_xyz.workspace.locales).length > 1) _xyz.utils.dropdown({
    title: 'Show layers for the following locale:',
    appendTo: document.getElementById('localeDropdown'),
    entries: _xyz.workspace.locales,
    label: 'name',
    val: 'loc',
    selected: _xyz.workspace.locale.key,
    onchange: e => {
      _xyz.hooks.removeAll();
      _xyz.hooks.set({locale : e.target.value});
      _xyz.workspace.loadLocale({ locale: _xyz.hooks.current.locale });
      createMap(_xyz);
    }
  });


  // Set platform specific interface functions.
  if (document.body.dataset.viewmode === 'mobile') mobile(_xyz);
  if (document.body.dataset.viewmode === 'desktop') desktop(_xyz);


  const btnWorkspace = document.getElementById('btnWorkspace');

  if (btnWorkspace) btnWorkspace.onclick = () => _xyz.workspace.admin();

  if (_xyz.log) console.log(_xyz);

  // const getCircularReplacer = () => {
  //   const seen = new WeakSet();
  //   return (key, value) => {
  //     if (typeof value === 'object' && value !== null) {
  //       if (seen.has(value)) {
  //         return;
  //       }
  //       seen.add(value);
  //     }
  //     return value;
  //   };
  // };
  
  // const noncircular = JSON.stringify(_xyz, getCircularReplacer());

  // const noncircularJSON =   JSON.parse(noncircular);

  // console.log(noncircularJSON);

  //logRocket(document.body.dataset.logrocket);

}

function createMap (_xyz) {

  document.body.style.gridTemplateRows = 'minmax(0, 1fr) 0';

  const attribution = {};
  attribution[_xyz.version] = _xyz.release;
  attribution['Openlayers'] = 'https://openlayers.org';
  ///attribution['Leaflet'] = 'https://leafletjs.com';

  // Create mapview control.
  _xyz.mapview.create({
    target: document.getElementById('Map'),
    attribution: attribution,
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z
    },
    scrollWheelZoom: true,
    btn: {
      ZoomIn: document.getElementById('btnZoomIn'),
      ZoomOut: document.getElementById('btnZoomOut'),
      Locate: document.getElementById('btnLocate'),
    }
  });

  // Create tableview control.
  _xyz.tableview.create({
    target: document.getElementById('tableview'),
    btn: {
      toggleTableview: document.getElementById('toggleTableview'),
      tableViewport: document.getElementById('btnTableViewport')
    }
  });

  _xyz.layers.listview.init({
    target: document.getElementById('layers')
  });

  _xyz.locations.listview.init({
    target: document.getElementById('locations'),
    clear: document.getElementById('clear_locations'),
  });

  _xyz.gazetteer.init({
    target: document.getElementById('gazetteer'),
    toggle: document.getElementById('btnGazetteer'),
  });

};