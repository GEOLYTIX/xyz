// export default _xyz => (location, callback) => {

//   if (!location) return;

//   if (_xyz.locations.current) _xyz.locations.current.remove();

//   Object.assign(location, _xyz.locations.location());

//   _xyz.locations.current = location;

//   if (callback) return location.get(callback);

//   location.get(location => {
//     location.draw();

//     if(!_xyz.mapview.popup || !location.marker) return alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
  
//     _xyz.mapview.popup({
//       latlng: [location.marker[1], location.marker[0]],
//       content: location.view.node
//     });
//   });

// };

export default _xyz => (location, flyTo) => {

  const existingRecord = getRecord(location);

  if (existingRecord) return existingRecord.clear();

  const record = _xyz.locations.listview.getFreeRecord();
  
  if (!record) return;

  Object.assign(location, _xyz.locations.location());

  location.style = Object.assign(
    {},
    _xyz.layers.list[location.layer].style,
    {
      color: record.color,
      fillColor: record.color,
      letter: record.letter,
      stroke: true,
      fill: true,
      fillOpacity: 0.2,
      icon: {
        url: _xyz.utils.svg_symbols({
          type: 'circle',
          style: {
            color: '#090',
            opacity: '0'
          }
        }),
        size: 40
      }
    });

  record.location = location;

  location.get(()=>{

    if(!location.infoj) {

      // Push the hook for the location.
      _xyz.hooks.filter(
        'locations',
        `${record.location.layer}!${record.location.table}!${record.location.id}`
      );

      return;
    }

    // Set marker coordinates from point geometry.
    if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;
       
    // Draw the location to the map.
    location.draw();

    // Draw letter marker.
    location.Marker = _xyz.mapview.draw.geoJSON({
      json: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
        }
      },
      pane: 'select_marker',
      style: {
        icon: {
          url: _xyz.utils.svg_symbols({
            type: 'markerLetter',
            style: {
              letter: record.letter,
              color: record.color,
            }
          }),
          size: 40,
          anchor: [20, 40]
        }
      }
    });
    
    // Add record to listview;
    _xyz.locations.listview.add(record);

    // Push the hook for the location.
    _xyz.hooks.push(
      'locations',
      `${record.location.layer}!${record.location.table}!${record.location.id}`
    );

    if (flyTo) record.location.flyTo();

  });

  function getRecord(location) {

    // Find free records in locations array.
    const records = _xyz.locations.listview.list.filter(record => record.location);

    const record = records.filter(record => record.location.id === location.id && record.location.layer === location.layer);

    // Return from selection if no free record is available.
    if (record.length === 0) return null;
  
    // Return the matching record.
    return record[0];
  };

};