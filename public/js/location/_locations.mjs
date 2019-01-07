import select from './select.mjs';

import draw from './draw.mjs';

import add from './add.mjs';

export default _xyz => {

  select(_xyz);

  draw(_xyz);

  add(_xyz);

  _xyz.locations.dom = document.getElementById('locations');

  _xyz.locations.getFreeRecord = () => {

  // Find free records in locations array.
    const freeRecords = _xyz.locations.list.filter(record => !record.location);

    // Return from selection if no free record is available.
    if (freeRecords.length === 0) return null;
  
    // Return the free record.
    return freeRecords[0];
  };

  _xyz.locations.init = () => {
 
    document.getElementById('clear_locations').addEventListener('click', () => {
      _xyz.hooks.remove('select');
      _xyz.locations.init();
    });
  
    // Hide the Locations Module.
    _xyz.locations.dom.parentElement.style.display = 'none';
  
    // Empty the locations list.
    _xyz.locations.dom.innerHTML = '';
    
    _xyz.locations.list.forEach(record => {
  
    // Return if location doesn't exist. ie. on init.
      if (!record.location) return;

      record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
  
      delete record.location;  
    });
  
    // Make select tab active on mobile device.
    if (_xyz.view.mobile) _xyz.view.mobile.activateLayersTab();
      
    // Set the layer display from hooks if present; Overwrites the default setting.
    // layer!table!id!lng!lat
    if (_xyz.hooks.current.select) _xyz.hooks.current.select.split(',').forEach(hook => {
      let params = hook.split('!');
      let layer = _xyz.layers.list[params[0]];
      _xyz.locations.select({
        locale: _xyz.locale,
        layer: layer.key,
        table: params[1],
        id: params[2],
        marker: [params[3].split(';')[0], params[3].split(';')[1]],
        edit: layer.edit
      });
    });
  
    _xyz.hooks.remove('select');
  
  };

};