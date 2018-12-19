import _xyz from '../_xyz.mjs';

_xyz.locations.select_output = location => {

  const record = _xyz.locations.getFreeRecord();

  if (!record) return;

  record.location = location;

  // Log the location when logging is enabled.
  if (_xyz.log) console.log(location);
 
  // Set marker coordinates from point geometry.
  if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;
  
  // Push the hook for the location.
  _xyz.hooks.push('select',
    record.location.layer + '!' +
        record.location.table + '!' +
        record.location.id + '!' +
        record.location.marker[0] + ';' +
        record.location.marker[1]
  );
    
  // Draw the record to the map.
  _xyz.locations.draw(record);
  
  // List the record
  _xyz.locations.add(record);

};