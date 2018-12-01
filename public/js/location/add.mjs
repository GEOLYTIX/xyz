import _xyz from '../_xyz.mjs';

import clear from './controls/clear.mjs';

import clipboard from './controls/clipboard.mjs';

import zoom from './controls/zoom.mjs';

import marker from './controls/marker.mjs';

import update from './controls/update.mjs';

import trash from './controls/trash.mjs';

import expander from './controls/expander.mjs';

import info from './info/_info.mjs';

export default record => {

  _xyz.locations.dom.parentElement.style.display = 'block';

  Object.values(_xyz.locations.dom.children).forEach(el => el.classList.remove('expanded'));

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
  clear(record);

  // Create copy to clipboard element
  clipboard(record);

  // Create the zoom control element which zoom the map to the bounds of the feature.
  zoom(record);

  // Create control to toggle marker.
  marker(record);

  // Create control to update editable items.
  // Update button will be invisible unless info has changed.
  update(record);

  // Create control to trash editable items.
  trash(record);

  // Create the expand control element which controls whether the data table is displayed for the feature.
  expander(record);

  // Add create and append infoj table to drawer.
  info(record);

  // Find free space and insert record.
  let idx = _xyz.locations.list.indexOf(record);
  
  _xyz.locations.dom.insertBefore(record.drawer, _xyz.locations.dom.children[idx]);

  if (_xyz.view.mode === 'desktop') setTimeout(() => {
    let el = document.querySelector('.mod_container > .scrolly');
    el.scrollTop = el.clientHeight;
  }, 500);

  // Make select tab active on mobile device.
  if (_xyz.view.mobile) _xyz.view.mobile.activateLocationsTab();

};