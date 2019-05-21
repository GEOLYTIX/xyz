import clear from './controls/clear.mjs';

import clipboard from './controls/clipboard.mjs';

import zoom from './controls/zoom.mjs';

import marker from './controls/marker.mjs';

import update from './controls/update.mjs';

import trash from './controls/trash.mjs';

import expander from './controls/expander.mjs';

export default _xyz => {

  return {

    getFreeRecord: getFreeRecord,

    removeRecord: removeRecord,

    addRecord: addRecord,

    add: add,

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

    // Create location view.
    location.view();
       
    // Draw the location to the map.
    location.draw();

    // Draw letter marker.
    location.Marker = _xyz.geom.geoJSON({
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


    if (location._flyTo) location.flyTo();
    
    // Add record to listview;
    _xyz.locations.listview.add(record);

  }

  function add(record) {

    if(!_xyz.locations.listview.node) return;

    _xyz.locations.listview.node.parentElement.style.display = 'block';
  
    Object.values(_xyz.locations.listview.node.children).forEach(el => el.classList.remove('expanded'));
  
    // Create drawer element to contain the header with controls and the infoj table with inputs.
    record.drawer = _xyz.utils.createElement({
      tag: 'div',
      options: {
        className: 'drawer expandable expanded'
      }
    });
  
    // Create the header element to contain the control elements
    record.header = _xyz.utils.createElement({
      tag: 'div',
      options: {
        textContent: record.letter,
        className: 'header pane_shadow'
      },
      style: {
        borderBottom: '2px solid ' + record.color
      },
      appendTo: record.drawer,
      eventListener: {
        event: 'click',
        funct: () => {
          _xyz.utils.toggleExpanderParent({
            expandable: record.drawer,
            accordeon: true,
            scrolly: _xyz.desktop && _xyz.desktop.listviews,
          });
        }
      }
    });
  
    // Add location view to drawer.
    record.drawer.appendChild(record.location.view.node);
  
    // Create the clear control element to control the removal of a feature from the select.layers.
    clear(_xyz, record);
  
    // Create copy to clipboard element
    clipboard(_xyz, record);
  
    // Create the zoom control element which zoom the map to the bounds of the feature.
    zoom(_xyz, record);
  
    // Create control to toggle marker.
    marker(_xyz, record);
  
    // Create control to update editable items.
    // Update button will be invisible unless info has changed.
    update(_xyz, record);
  
    // Create control to trash editable items.
    trash(_xyz, record);
  
    // Create the expand control element which controls whether the data table is displayed for the feature.
    expander(_xyz, record);
  
    // Find free space and insert record.
    let idx = _xyz.locations.listview.records.indexOf(record);
    
    _xyz.locations.listview.node.insertBefore(record.drawer, _xyz.locations.listview.node.children[idx]);
  
    if (_xyz.desktop) setTimeout(() => {
      _xyz.desktop.listviews.scrollTop = _xyz.desktop.listviews.clientHeight;
    }, 500);
  
    // Make select tab active on mobile device.
    if (_xyz.mobile) _xyz.mobile.activateLocationsTab();

  }

};