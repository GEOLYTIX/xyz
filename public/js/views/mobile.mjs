import _xyz from '../_xyz.mjs';

export default () => {

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

    target.parentNode.children.forEach(el => el.classList.remove('active'));
    target.classList.add('active');
    modules.forEach(m => m.classList.add('hidden'));
    mod.classList.remove('hidden');
    checkOverlap (mod);

    let locations = document.querySelector('#Locations > .content');

    setTimeout(() => {
      if (locations.children.length === 0) tabLocations.classList.add('hidden');
    }, 300);
  }
};