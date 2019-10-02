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
  
    valChange: valChange

  };

  location.view = view;

  location.view.update();

  // Create drawer element to contain the header with controls and the infoj table with inputs.
  location.view.drawer = _xyz.utils.wire()`<div class="drawer expandable expanded">`;


  // Create the header element to contain the control elements
  location.view.header = _xyz.utils.wire()`
  <div
  style = "${'border-bottom: 2px solid ' + location.style.strokeColor}"
  class = "header">
  <div>
  ${String.fromCharCode(64 + _xyz.locations.list.length - _xyz.locations.list.indexOf(location.record))}`;
  

  location.view.header.onclick = () => {
    _xyz.utils.toggleExpanderParent({
      expandable: location.view.drawer,
      accordeon: true,
    });
  };

  location.view.drawer.appendChild(location.view.header);


  // Expander icon.
  location.infoj && location.view.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.strokeColor}"
  title = "Toggle location view drawer."
  class = "material-icons cursor noselect btn_header expander"
  onclick = ${e => {
    e.stopPropagation();
    
    _xyz.utils.toggleExpanderParent({
      expandable: location.view.drawer,
    });
  }}>`);


  // Zoom to location bounds.
  location.view.header.appendChild(_xyz.utils.wire()`
    <i
    style = "${'color: ' + location.style.strokeColor}"
    title = "Zoom map to feature bounds"
    class = "material-icons cursor noselect btn_header"
    onclick = ${e => {
      e.stopPropagation();
      location.flyTo();
    }}>search`);


  // Update icon.
  location.view.upload = _xyz.utils.wire()`
  <i
  style = "${'display: none; color: ' + location.style.strokeColor}"
  title = "Save changes to cloud."
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();
    
    location.update();

  }}>cloud_upload`;

  location.view.header.appendChild(location.view.upload);

  if (location.layer.edit) {

    location.view.editor = _xyz.utils.wire()`
    <i
    style = "${'color: ' + location.style.strokeColor}"
    title = "Edit the locations geometry."
    class = "material-icons cursor noselect btn_header"
    onclick = ${e => {
    e.stopPropagation();

    if (location.view.header.classList.contains('edited')) return _xyz.mapview.interaction.edit.finish();

    location.view.header.classList.add('edited');

    _xyz.mapview.interaction.edit.begin({
      location: location,
      type: 'LineString',
      callback: () => {
        location.view.header.classList.remove('edited');
      }
    });

  }}>build`;

    location.view.header.appendChild(location.view.editor);
    
  }
 


  // Trash icon.
  location.view.trash = _xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.strokeColor}"
  title = "Delete location."
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();
    location.trash();
  }}>delete`;

  location.editable && location.view.header.appendChild(location.view.trash);


  // Copy to clipboard. *** aga: disabled as overrriden by report functionality
  /*location.view.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.strokeColor}"
  title = "Copy to clipboard"
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();
    location.clipboard();
  }}>file_copy`);*/


  // Toggle marker.
  location.view.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.strokeColor}"
  title = "Hide marker"
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();

    if (e.target.textContent === 'location_off') {
      _xyz.map.removeLayer(location.Marker);
      e.target.textContent = 'location_on';
      e.target.title = 'Show marker';

    } else {
      _xyz.map.addLayer(location.Marker);
      e.target.textContent = 'location_off';
      e.target.title = 'Hide marker';
    }
  }}>location_off`);
  

  // Clear selection.
  location.view.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + location.style.strokeColor}"
  title = "Remove feature from selection"
  class = "material-icons cursor noselect btn_header"
  onclick = ${e => {
    e.stopPropagation();
    location.remove();
  }}>clear`);
  

  // Add location view to drawer.
  location.view.drawer.appendChild(location.view.node);

};