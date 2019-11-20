import infoj from './infoj.mjs';

import group from './group.mjs';

import streetview from './streetview.mjs';

import images from './images.mjs';

import documents from './documents.mjs';

import meta from './meta.mjs';

import tableDefinition from './tableDefinition.mjs';

import orderedList from './orderedList.mjs';

import dashboard from './dashboard.mjs';

import report from './report.mjs';

import boolean from './boolean.mjs';

import geometry from './geometry/_geometry.mjs';

import edit from './edit/_edit.mjs';

export default _xyz => {

  const view = {

    create: create,

    infoj: infoj(_xyz),

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

  };

  return view;


  function create(location){

    if (!location.view) {
      location.view = _xyz.utils.wire()`<div class="drawer location-view expandable expanded">`;
    }

    location.view.innerHTML = '';
    location.view.classList.remove('disabled');

    location.view.addEventListener('valChange', e => {
      const newValue = typeof e.detail.newValue === 'undefined' ? e.detail.input.value : e.detail.newValue;
  
      if (e.detail.entry.value != newValue) {

        e.detail.entry.newValue = newValue;
        e.detail.input.classList.add('primary-colour');
      } else {

        delete e.detail.entry.newValue;
        e.detail.input.classList.remove('primary-colour');
      }

      // Hide upload button if no other field in the infoj has a newValue.
      if (!e.detail.entry.location.infoj.some(field => typeof field.newValue !== 'undefined')) {

        upload.style.display = 'none';
      } else {

        upload.style.display = 'inline-block';
      }
    });

    
    // Create the header element to contain the control elements
    const header = _xyz.utils.wire()`
    <div
      class = "header"
      style = "${'border-bottom: 2px solid ' + location.style.strokeColor}"
      onclick = ${e => {
        e.preventDefault();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}>
      <div>${String.fromCharCode(64 + _xyz.locations.list.length - _xyz.locations.list.indexOf(location.record))}`;

    location.view.appendChild(header);


    // Expander icon.
    location.infoj && header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Toggle location view drawer."
      class = "btn-header xyz-icon icon-expander "
      onclick = ${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target);
      }}>`);


    // Zoom to location bounds.
    header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Zoom map to feature bounds"
      class = "btn-header xyz-icon icon-search"
      onclick = ${e => {
        e.stopPropagation();
        location.flyTo();
      }}>`);


    // Update icon.
    const upload = _xyz.utils.wire()`
    <button
      style = "${'display: none; filter: ' + location.colorFilter}"
      title = "Save changes to cloud."
      class = "btn-header xyz-icon icon-cloud-upload"
      onclick = ${e => {
        e.stopPropagation();
        location.update();
      }}>`;

    header.appendChild(upload);


    // Edit geometry icon
    location.layer.edit && header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Edit the locations geometry."
      class = "btn-header xyz-icon icon-build"
      onclick = ${e => {
        e.stopPropagation();

        if (header.classList.contains('edited')) return _xyz.mapview.interaction.edit.finish();

        header.classList.add('edited', 'secondary-colour-bg');

        _xyz.mapview.interaction.edit.begin({
          location: location,
          type: 'LineString',
          callback: () => {
            header.classList.remove('edited', 'secondary-colour-bg');
          }
        });
      }}>`);


    // Trash icon.
    location.editable && header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Delete location."
      class = "btn-header xyz-icon icon-trash"
      onclick = ${e => {
        e.stopPropagation();
        location.trash();
      }}>`);


    // Toggle marker.
    header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Hide marker"
      class = "btn-header xyz-icon icon-location-tick" 
      onclick = ${e => {
        e.stopPropagation();
        if(e.target.classList.contains('icon-location')){
          e.target.classList.remove('icon-location')
          e.target.classList.add('icon-location-tick')
          _xyz.map.addLayer(location.Marker);
        } else {
          e.target.classList.remove('icon-location-tick');
          e.target.classList.add('icon-location');
          _xyz.map.removeLayer(location.Marker);
        }
      }}>`);

    // Clear selection.
    header.appendChild(_xyz.utils.wire()`
    <button
      style = "${'filter: ' + location.colorFilter}"
      title = "Remove feature from selection"
      class = "btn-header xyz-icon icon-close"
      onclick = ${e => {
        e.stopPropagation();
        location.remove();
        _xyz.map.updateSize();
      }}>`);


    location.infoj && location.view.appendChild(view.infoj(location));

  };

}