import select from './select.mjs';

import add from './add.mjs';

export default _xyz => {

  select(_xyz);

  const listview = {

    node: document.getElementById('locations'),

    clear: document.getElementById('clear_locations'),

    getFreeRecord: getFreeRecord,

    add: add(_xyz),

    init: init,

  };

  // Clear locations button to remove hooks and reset locations module.
  listview.clear.onclick = () => {
    _xyz.hooks.remove('select');
    _xyz.locations.listview.init();
  };

  return listview;

  function getFreeRecord() {

    // Find free records in locations array.
    const freeRecords = _xyz.locations.list.filter(record => !record.location);

    // Return from selection if no free record is available.
    if (freeRecords.length === 0) return null;
  
    // Return the free record.
    return freeRecords[0];
  };

  // Init sequence to be called on locale init;
  function init() {
  
    // Hide the Locations Module.
    _xyz.locations.listview.node.parentElement.style.display = 'none';
  
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';
    
    // Iterate through all locations in list.
    _xyz.locations.list.forEach(record => {
  
      // Return if location doesn't exist. ie. on init.
      if (!record.location) return;

      // Remove all geometries associated to the location.
      record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
      // And add additional geometries
      if(record.location.geometries.additional) record.location.geometries.additional.forEach(geom => _xyz.map.removeLayer(geom));
  
      // Delete the location.
      delete record.location;

    });
  
    // Make select tab active on mobile device.
    if (_xyz.mobile) _xyz.mobile.activateLayersTab();
      
    // Set the layer display from hooks if present; Overwrites the default setting.
    // layer!table!id!lng!lat
    if (_xyz.hooks.current.select) _xyz.hooks.current.select.split(',').forEach(hook => {

      let
        params = hook.split('!'),
        layer = _xyz.layers.list[decodeURIComponent(params[0])];

      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: layer.key,
        table: params[1],
        id: params[2],
        edit: layer.edit
      });
      
    });
  
    _xyz.hooks.remove('select');
  
  };

};