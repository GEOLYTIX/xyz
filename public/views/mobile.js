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



  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // Set platform specific interface functions.

  _xyz.mobile = {};

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  //move map up on document scroll
  document.addEventListener('scroll',
    () => document.getElementById('Map')
      .style['marginTop'] = -parseInt(window.pageYOffset / 2) + 'px'
  );

  let
    listViews = document.querySelectorAll('.listview'),
    tabs = document.querySelector('.tab_bar'),
    tabLayers = document.getElementById('tabLayers'),
    modLayers = document.getElementById('modLayers'),
    modLocations = document.getElementById('modLocations');

  _xyz.mobile.tabLocations = document.getElementById('tabLocations');

  modLayers.addEventListener('scroll', e => checkOverlap(e.target));
  modLocations.addEventListener('scroll', e => checkOverlap(e.target));

  function checkOverlap(mod) {
    if (mod.scrollTop > 0) {
      tabs.classList.add('pane_shadow');
      return;
    }
    tabs.classList.remove('pane_shadow');
  }

  _xyz.mobile.activateLayersTab = () => activateTab(tabLayers, modLayers);

  _xyz.mobile.activateLocationsTab = () => {
    _xyz.mobile.tabLocations.classList.remove('displaynone');
    activateTab(_xyz.mobile.tabLocations, modLocations);
  };

  tabLayers.addEventListener('click', () => activateTab(tabLayers, modLayers));

  _xyz.mobile.tabLocations.addEventListener('click', () => activateTab(_xyz.mobile.tabLocations, modLocations));

  function activateTab(target, mod) {

    Object.values(target.parentNode.children).forEach(el => {
      el.classList.remove('active');
    });
    target.classList.add('active');
    listViews.forEach(m => m.classList.add('displaynone'));
    mod.classList.remove('displaynone');
    checkOverlap(mod);

  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    


  const btnWorkspace = document.getElementById('btnWorkspace');

  if (btnWorkspace) btnWorkspace.onclick = () => _xyz.workspace.admin();


  // Select locations from hooks.
  if (_xyz.hooks) _xyz.hooks.current.locations.forEach(_hook => {
  
    let hook = _hook.split('!');
    
    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: _xyz.layers.list[decodeURIComponent(hook[0])],
      table: hook[1],
      id: hook[2]
    });
          
  });


  if (_xyz.log) console.log(_xyz);

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
    target: document.getElementById('locations')
  });

  document.getElementById('clear_locations').onclick = () => {
    _xyz.hooks.remove('locations');

    _xyz.locations.listview.init({
      target: document.getElementById('locations')
    });
  };

  _xyz.gazetteer.init({
    target: document.getElementById('gazetteer'),
    toggle: document.getElementById('btnGazetteer'),
  });

};