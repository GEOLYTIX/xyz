export default _xyz => {

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
    tabLocations = document.getElementById('tabLocations'),
    modLocations = document.getElementById('modLocations');

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
    tabLocations.classList.remove('displaynone');
    activateTab(tabLocations, modLocations);
  };

  tabLayers.addEventListener('click', () => activateTab(tabLayers, modLayers));

  tabLocations.addEventListener('click', () => activateTab(tabLocations, modLocations));

  function activateTab(target, mod) {

    Object.values(target.parentNode.children).forEach(el => {
      el.classList.remove('active');
    });
    target.classList.add('active');
    listViews.forEach(m => m.classList.add('displaynone'));
    mod.classList.remove('displaynone');
    checkOverlap(mod);

    // Run locations init when all records are free.
    const freeRecords = _xyz.locations.listview.list.filter(record => !record.location);
    if (freeRecords.length === _xyz.locations.listview.list.length) tabLocations.classList.add('displaynone');

  }

};