import infoj from './infoj.mjs'

import streetview from './streetview.mjs'

import images from './images.mjs'

import documents from './documents.mjs'

import report from './report.mjs'

import boolean from './boolean.mjs'

import geometry from './geometry/_geometry.mjs'

import edit from './edit/_edit.mjs'

import dataview from './dataview.mjs'

import json from './json.mjs'

export default _xyz => {

  return {

    create: create,

    infoj: infoj(_xyz),

    streetview: streetview(_xyz),

    images: images(_xyz),

    documents: documents(_xyz),

    geometry: geometry(_xyz),

    edit: edit(_xyz),

    boolean: boolean(_xyz),

    report: report(_xyz),

    dataview: dataview(_xyz),

    json: json(_xyz)

  }

  function create(location) {

    if (location.view) location.view.remove()

    // Create location view DOM element.
    location.view = _xyz.utils.html.node `<div class="drawer location-view expandable expanded">`

    // Create the header element to contain the control elements.
    const header = location.view.appendChild(_xyz.utils.html.node `
      <div
        class = "header"
        style = "${'border-bottom: 2px solid ' + location.style.strokeColor}"
        onclick = ${e => {
          e.preventDefault()
          _xyz.utils.toggleExpanderParent(e.target, true)
        }}>
        <div>${String.fromCharCode(65 + _xyz.locations.list.indexOf(location.record))}`)


    // Expander icon.
    location.infoj && header.appendChild(_xyz.utils.html.node `
      <button
        style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
        title = ${_xyz.language.location_drawer_toggle}
        class = "btn-header xyz-icon icon-expander "
        onclick = ${e => {
          e.stopPropagation()
          _xyz.utils.toggleExpanderParent(e.target)
        }}>`)


    // Zoom to location bounds.
    header.appendChild(_xyz.utils.html.node `
      <button
        style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
        title = ${_xyz.language.location_zoom}
        class = "btn-header xyz-icon icon-search"
        onclick = ${e => {
          e.stopPropagation()
          location.flyTo()
        }}>`)


    // Update icon.
    const upload = header.appendChild(_xyz.utils.html.node `
      <button
        style = "${'display: none; filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
        title = ${_xyz.language.location_save}
        class = "btn-header xyz-icon icon-cloud-upload"
        onclick = ${e => {
          e.stopPropagation()
          location.update()
        }}>`)


    // Edit geometry icon.
    location.layer.edit && location.layer.edit.geometry && header.appendChild(_xyz.utils.html.node `
      <button
        style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
        title = ${_xyz.language.location_edit_geometry}
        class = "btn-header xyz-icon icon-build"
        onclick = ${e => {

          e.stopPropagation()

          if (header.classList.contains('edited')) return _xyz.mapview.interaction.edit.finish()

          header.classList.add('edited', 'secondary-colour-bg')

          _xyz.mapview.interaction.edit.begin({
            location: location,
            type: 'LineString',
            callback: () => {
              header.classList.remove('edited', 'secondary-colour-bg')
            }
          })

        }}>`)


    // Trash icon.
    location.layer.edit && location.layer.edit.delete && header.appendChild(_xyz.utils.html.node `
      <button
        style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
        title = ${_xyz.language.location_delete}
        class = "btn-header xyz-icon icon-trash"
        onclick = ${e => {
          e.stopPropagation()
          location.trash()
        }}>`)


    // Toggle marker.
    header.appendChild(_xyz.utils.html.node `
    <button
      style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
      title = ${_xyz.language.location_hide_marker}
      class = "btn-header xyz-icon icon-location-tick" 
      onclick = ${e => {
        e.stopPropagation()

        e.target.classList.toggle('icon-location')
        e.target.classList.toggle('icon-location-tick')
        e.target.classList.contains('icon-location') ?
          _xyz.map.removeLayer(location.Marker) :
          _xyz.map.addLayer(location.Marker)

      }}>`)


    // Clear selection.
    header.appendChild(_xyz.utils.html.node `
    <button
      style = "${'filter: ' + location.colorFilter + '; -webkit-filter: ' + location.colorFilter}"
      title = ${_xyz.language.location_remove}
      class = "btn-header xyz-icon icon-close"
      onclick = ${e => {
        e.stopPropagation()
        location.remove()
        _xyz.map.updateSize()
      }}>`)


    // Add listener for custom valChange event.
    location.view.addEventListener('valChange', e => {

      // Get value from newValue or input value.
      //const newValue = typeof e.detail.newValue === 'undefined' && e.detail.input.value || e.detail.newValue
      const newValue = typeof e.detail.newValue === 'undefined' && e.detail.newValue || e.detail.input.value
      
      if (e.detail.entry.value !== newValue) {

        // New value is different from current value.
        e.detail.entry.newValue = newValue
        e.detail.input.classList.add('primary-colour')
      } else {

        // New value is the same as current value.
        delete e.detail.entry.newValue
        e.detail.input.classList.remove('primary-colour')
      }

      // Hide upload button if no other field in the infoj has a newValue.
      upload.style.display = e.detail.entry.location.infoj
        .some(field => typeof field.newValue !== 'undefined') && 'inline-block' || 'none'

    })

    if (!location.infoj) return

    let infoj

    location.view.addEventListener('updateInfo', updateInfo)

    updateInfo()

    function updateInfo(){

      infoj && infoj.remove()

      upload.style.display = 'none'

      location.view.classList.remove('disabled')

      infoj = _xyz.locations.view.infoj(location)

      location.view.appendChild(infoj)

    }
  
  }

}