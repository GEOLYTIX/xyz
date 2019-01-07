export default _xyz => {

  _xyz.view.mobile = {};
    
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  //move map up on document scroll
  document.addEventListener('scroll',
    () => document.getElementById('Map').style['marginTop'] = -parseInt(window.pageYOffset / 2) + 'px');

  let
    modules = document.querySelectorAll('.mod_container > .module'),
    tabs = document.querySelector('.tab_bar'),
    tabLayers = document.getElementById('tabLayers'),
    modLayers = document.getElementById('modLayers'),
    tabLocations = document.getElementById('tabLocations'),
    modLocations = document.getElementById('modLocations');

  modLayers.addEventListener('scroll', e => checkOverlap (e.target));
  modLocations.addEventListener('scroll', e => checkOverlap (e.target));

  function checkOverlap (mod) {
    if (mod.scrollTop > 0) {
      tabs.classList.add('pane_shadow');
      return;
    }
    tabs.classList.remove('pane_shadow');
  }

  _xyz.view.mobile.activateLayersTab = () => activateTab(tabLayers, modLayers);

  _xyz.view.mobile.activateLocationsTab = () => {
    tabLocations.classList.remove('hidden');
    activateTab(tabLocations, modLocations);
  };

  tabLayers.addEventListener('click', () => activateTab(tabLayers, modLayers));

  tabLocations.addEventListener('click', () => activateTab(tabLocations, modLocations));

  function activateTab(target, mod) {

    Object.values(target.parentNode.children).forEach(el => {
      el.classList.remove('active');
    });
    target.classList.add('active');
    modules.forEach(m => m.classList.add('hidden'));
    mod.classList.remove('hidden');
    checkOverlap (mod);

    // Run locations init when all records are free.
    const freeRecords = _xyz.locations.list.filter(record => !record.location);
    if (freeRecords.length === _xyz.locations.list.length) tabLocations.classList.add('hidden');

  }

  _xyz.locations.select_list = (list, lnglat, layer) => {
  
    let dom = {
      map: document.getElementById('Map'),
      location_drop: document.querySelector('.location_drop'),
      location_drop__close: document.querySelector('.location_drop__close'),
      location_table: document.querySelector('.location_table'),
      map_button: document.querySelector('.btn_column')
    };

    dom.location_table.innerHTML = '';
    dom.map_button.style['display'] = 'none';
    dom.location_drop.style['display'] = 'block';

    for (let i = 0; i < list.length; i++) {

      _xyz.utils.createElement({
        tag: 'li',
        options: {
          textContent: list[i].label,
          'data-id': list[i].id,
          'data-marker': list[i].lnglat
        },
        appendTo: dom.location_table,
        eventListener: {
          event: 'click',
          funct: e => {
  
            _xyz.locations.select({
              locale: layer.locale,
              layer: layer.key,
              table: layer.table,
              id: e.target['data-id'],
              marker: e.target['data-marker'],
              edit: layer.edit
            });
  
          }
        }
      });
  
    }

    // Button event to close the .location_drop.
    dom.location_drop__close.addEventListener('click', () => {
      dom.location_drop.style['display'] = 'none';
      dom.map_button.style['display'] = 'block';
    });

  };

};