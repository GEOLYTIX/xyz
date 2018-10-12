import _xyz from '../_xyz.mjs';

import _records from './records.mjs';

import select from './select.mjs';
_xyz.selectLocation = select;

import draw from './draw.mjs';
_xyz.drawRecord = draw;

import list from './list.mjs';
_xyz.listRecord = list;

export default () => {

  // Make select tab active on mobile device.
  if (_xyz.activateLayersTab) _xyz.activateLayersTab();

  _xyz.locations = document.getElementById('locations');

  document.getElementById('clear_locations').addEventListener('click', () => {
    _xyz.utils.removeHook('select');
    _xyz.initLocations();
  });

  // Hide the Locations Module.
  _xyz.locations.parentElement.style.display = 'none';

  // Empty the locations list.
  _xyz.locations.innerHTML = '';

  // Create select pane. This pane has a shadow filter associated in the css.
  _xyz.map.createPane('select_display');
  _xyz.map.getPane('select_display').style.zIndex = 501;
  _xyz.map.createPane('select');
  _xyz.map.getPane('select').style.zIndex = 600;
  _xyz.map.createPane('select_marker');
  _xyz.map.getPane('select_marker').style.zIndex = 601;
  _xyz.map.createPane('select_circle');
  _xyz.map.getPane('select_circle').style.zIndex = 602;
  
  if (_xyz.records) _xyz.records.forEach(record => {
    if (record.location && record.location.L) _xyz.map.removeLayer(record.location.L);
    if (record.location && record.location.M) _xyz.map.removeLayer(record.location.M);
    if (record.location && record.location.D) _xyz.map.removeLayer(record.location.D);
    record.location = null;
  });

  _xyz.records = _records;
    
  // Set the layer display from hooks if present; Overwrites the default setting.
  // layer!table!id!lng!lat
  if (_xyz.hooks.select) _xyz.hooks.select.split(',').forEach(hook => {
    let params = hook.split('!');
    _xyz.selectLocation({
      layer: params[0],
      table: params[1],
      id: params[2],
      marker: [params[3].split(';')[0], params[3].split(';')[1]]
    });
  });

  _xyz.utils.removeHook('select');

};