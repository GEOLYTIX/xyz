import _xyz from '../_xyz.mjs';

import addInfojToList from './table.mjs';

import * as controls from './controls.mjs';

export default record => {

  _xyz.locations.parentElement.style.display = 'block';

  Object.values(_xyz.locations.children).forEach(el => el.classList.remove('expanded'));

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
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Create the clear control element to control the removal of a feature from the select.layers.
  controls.clear(record);
        
  // Create copy to clipboard element
  controls.clipboard(record);

  // Create the zoom control element which zoom the map to the bounds of the feature.
  controls.zoom(record);

  // Create control to toggle marker.
  controls.marker(record);
        
  // Create the expand control element which controls whether the data table is displayed for the feature.
  controls.expander(record);

  // Create control to update editable items.
  if (record.location.editable) controls.update(record);

  // Create control to trash editable items.
  if (record.location.editable) controls.trash(record);

  // Add header element to the drawer.
  record.drawer.appendChild(record.header);

  // Add create and append infoj table to drawer.
  record.drawer.appendChild(addInfojToList(record));

  // Find free space and insert record.
  let idx = _xyz.records.indexOf(record);
  _xyz.locations.insertBefore(record.drawer, _xyz.locations.children[idx]);

  if (_xyz.view_mode === 'desktop') setTimeout(() => {
    let el = document.querySelector('.mod_container > .scrolly');
    el.scrollTop = el.clientHeight;
  }, 500);

  // Make select tab active on mobile device.
  if (_xyz.activateLocationsTab) _xyz.activateLocationsTab();

};