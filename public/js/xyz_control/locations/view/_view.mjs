import group from './group.mjs';

import streetview from './streetview.mjs';

import images from './images/_images.mjs';

import documents from './documents/_documents.mjs';

import geometry from './geometry/_geometry.mjs';

import meta from './meta.mjs';

import edit from './edit/_edit.mjs';

import valChange from './edit/valChange.mjs';

import tableDefinition from './tableDefinition.mjs';

import orderedList from './orderedList.mjs';

import dashboard from './dashboard.mjs';

import report from './report.mjs';

import update from './update.mjs';

import boolean from './boolean.mjs';




export default _xyz => function () {

  const location = this;

  const view = {

    update: update(_xyz, location),

    streetview: streetview(_xyz),
  
    images: images(_xyz),

    documents: documents(_xyz),
  
    group: group(_xyz),
  
    geometry: geometry(_xyz),
  
    meta: meta(_xyz),
  
    edit: edit(_xyz),
  
    boolean: boolean(_xyz),
  
    tableDefinition: tableDefinition(_xyz),
  
    orderedList: orderedList(_xyz),

    dashboard: dashboard(_xyz),
  
    report: report(_xyz),
  
    valChange: valChange,

  };

  location.view = view;

  location.view.update();

  // Create drawer element to contain the header with controls and the infoj table with inputs.
  location.view.drawer = _xyz.utils.wire()`<div class="drawer expandable expanded">`;


  // Create the header element to contain the control elements
  location.view.header = _xyz.utils.wire()`
  <div
  style = "${'border-bottom: 2px solid ' + location.style.color}"
  class = "header">
  <div>
  ${String.fromCharCode(64 + _xyz.locations.list.length - _xyz.locations.list.indexOf(location.record))}`;
  

  location.view.header.onclick = () => {
    _xyz.utils.toggleExpanderParent({
      expandable: location.view.drawer,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews,
    });
  };

  location.view.drawer.appendChild(location.view.header);

  location.view.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.color}"
  title = "Remove feature from selection"
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();
    location.remove();
  }}>clear`);
  
  // Create copy to clipboard element
  //clipboard(_xyz, location);
  
  // Create the zoom control element which zoom the map to the bounds of the feature.
  //zoom(_xyz, location);
  
  // Create control to toggle marker.
  //marker(_xyz, location);
  
  // Create control to update editable items.
  // Update button will be invisible unless info has changed.
  //update(_xyz, location);
  
  // Create control to trash editable items.
  //trash(_xyz, location);
  
  // Create the expand control element which controls whether the data table is displayed for the feature.
  //expander(_xyz, location);

  // Add location view to drawer.
  location.view.drawer.appendChild(location.view.node);




};