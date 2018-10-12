import _xyz from '../_xyz.mjs';

import select from './select.mjs';
_xyz.locations.select = select;

import draw from './draw.mjs';
_xyz.locations.draw = draw;

import add from './add.mjs';
_xyz.locations.add = add;

export default () => {

  // Make select tab active on mobile device.
  if (_xyz.view.mobile) _xyz.view.mobile.activateLayersTab();

  _xyz.locations.dom = document.getElementById('locations');

  document.getElementById('clear_locations').addEventListener('click', () => {
    _xyz.hooks.remove('select');
    _xyz.locations.init();
  });

  // Hide the Locations Module.
  _xyz.locations.dom.parentElement.style.display = 'none';

  // Empty the locations list.
  _xyz.locations.dom.innerHTML = '';
  
  _xyz.locations.list.forEach(record => {
    if (record.location && record.location.L) _xyz.map.removeLayer(record.location.L);
    if (record.location && record.location.M) _xyz.map.removeLayer(record.location.M);
    if (record.location && record.location.D) _xyz.map.removeLayer(record.location.D);
    record.location = null;
  });
    
  // Set the layer display from hooks if present; Overwrites the default setting.
  // layer!table!id!lng!lat
  if (_xyz.hooks.current.select) _xyz.hooks.current.select.split(',').forEach(hook => {
    let params = hook.split('!');
    _xyz.locations.select({
      layer: params[0],
      table: params[1],
      id: params[2],
      marker: [params[3].split(';')[0], params[3].split(';')[1]]
    });
  });

  _xyz.hooks.remove('select');

};