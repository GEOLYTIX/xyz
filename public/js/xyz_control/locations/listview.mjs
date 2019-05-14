import add from './add.mjs';

export default _xyz => {

  return {

    getFreeRecord: getFreeRecord,

    removeRecord: removeRecord,

    addRecord: addRecord,

    add: add(_xyz),

    init: init,

  };

  // Init sequence to be called on locale init;
  function init(params) {

    if (_xyz.mobile) {
      _xyz.mobile.tabLocations.classList.add('displaynone');
      _xyz.mobile.activateLayersTab();
    }

    // Clear locations button to remove hooks and reset location listview.
    if (params.clear){

      _xyz.locations.listview.clear = params.clear;
    
      _xyz.locations.listview.clear.onclick = () => {
        _xyz.hooks.remove('locations');
        _xyz.locations.listview.init(params);
      };
    }
    

    _xyz.locations.listview.node = params.target;

    // Hide the Locations Module.
    _xyz.locations.listview.node.parentElement.style.display = 'none';
    
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';
      
    // Iterate through all locations in list.
    if (_xyz.locations.listview.records) {
      _xyz.locations.listview.records.forEach(record => {
    
      // Return if location doesn't exist. ie. on init.
        if (!record.location) return;
  
        record.location.remove();
  
        // Delete the location.
        delete record.location;
  
      });
    } else {
      _xyz.locations.listview.records = [
        {
          letter: 'A',
          color: '#9c27b0'
        },
        {
          letter: 'B',
          color: '#2196f3'
        },
        {
          letter: 'C',
          color: '#009688'
        },
        {
          letter: 'D',
          color: '#cddc39',
        },
        {
          letter: 'E',
          color: '#ff9800'
        },
        {
          letter: 'F',
          color: '#673ab7'
        },
        {
          letter: 'G',
          color: '#03a9f4'
        },
        {
          letter: 'H',
          color: '#4caf50'
        },
        {
          letter: 'I',
          color: '#ffeb3b'
        },
        {
          letter: 'J',
          color: '#ff5722'
        },
        {
          letter: 'K',
          color: '#0d47a1'
        },
        {
          letter: 'L',
          color: '#00bcd4'
        },
        {
          letter: 'M',
          color: '#8bc34a'
        },
        {
          letter: 'N',
          color: '#ffc107'
        },
        {
          letter: 'O',
          color: '#d32f2f'
        }];
    }
    
    // Make select tab active on mobile device.
    //if (_xyz.mobile) _xyz.mobile.activateLayersTab();
        
    // Select locations from hooks.
    if (_xyz.hooks) _xyz.hooks.current.locations.forEach(hook => {
  
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
     
  };

  function getFreeRecord() {

    // Find free records in locations array.
    const freeRecords = _xyz.locations.listview.records.filter(record => !record.location);

    // Return from selection if no free record is available.
    if (freeRecords.length === 0) return null;
  
    // Return the free record.
    return freeRecords[0];
  };

  function removeRecord(location) {

    const records = _xyz.locations.listview.records.filter(record => record.location);

    const record = records.filter(record => record.location.id === location.id && record.location.layer === location.layer);

    // Return from selection if no free record is available.
    if (record.length === 0) return null;
  
    // Remove record;
    record[0].clear();

    return true;
  };

  function addRecord(location) {

    // Get free record for location from listview.
    const record = getFreeRecord();

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
      }
    );

    record.location = location;

    // Set marker coordinates from point geometry.
    if (location.geometry.type === 'Point') location.marker = location.geometry.coordinates;


    // location.view = location.view(_xyz);
    // location.view.update();
    _xyz.locations.view(location);

       
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

  }

};