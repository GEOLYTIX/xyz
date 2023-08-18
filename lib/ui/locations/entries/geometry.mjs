export default entry => {

  // The geometry value must be JSON.
  entry.value = typeof entry.value === 'string' && JSON.parse(entry.value) || entry.value

  // Turn off display with no geometry to display.
  entry.display = (entry.display && entry.value)

  // Return if entry has no geometry value and cannot be drawn in to.
  if (!entry.value && !entry.draw) return;

  // Assigning the mapview to the entry makes the entry behave like a layer object for draw and modify interactions.
  entry.mapview = entry.location.layer.mapview

  // Assign Style if not already assigned.
  entry.Style = entry.Style
  
    // Create OL style object from style object.
    || typeof entry.style === 'object' && mapp.utils
        .style(Object.assign({}, entry.location?.style || {}, entry.style))

    // Assign style from location.
    || entry.location.Style

  // Assign method to show geometry in mapview.
  entry.show = show

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'Geometry',
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,
    disabled: !entry.value,
    onchange: (checked) => {
      
      // Show geometry of checked.
      if (checked) {
        entry.show()

      } else {
        
        // Remove the geometry layer from map.
        entry.display = false
        entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L)
      }
    }
  })

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Push elements for drawing methods into list.
  const list = []
  
  if (typeof entry.draw === 'object') {

    entry.draw.callback = feature => {

      if (!feature) return;

      // Remove existing entry geometry layer.
      entry.location.layer.mapview.Map.removeLayer(entry.L)

      // Assign feature geometry as new value.
      entry.newValue = feature.geometry
      entry.location.update()
    }

    Object.keys(entry.draw).forEach(key => {
   
      if (mapp.ui.elements.drawing[key]) {
        list.push(mapp.ui.elements.drawing[key](entry))
      }
    })

  }

  // Push modify button into list.
  if (entry.edit?.geometry) {

    // If label is provided for the Modify Button, use it. Otherwise use default.
    let modifyBtnLabel = entry.edit?.modifyBtnOnly?.label || 'Modify Geometry';

    let modifyBtn = mapp.utils.html.node`
      <button
        class="flat bold wide primary-colour"
        onclick=${e=>modify(e, entry)}>
        ${modifyBtnLabel}`

    if (entry.edit?.modifyBtnOnly) {
      return modifyBtn
    }

    list.push(modifyBtn)
  }

  // Push modify button into list.
  entry.value && entry.edit?.delete && list.push(mapp.utils.html`
    <button
      class="flat wide no-colour"
      onclick=${() => {

        if (entry.display) {
          remove()
          return;
        }

        entry.show()

        // Allow for geometries to be shown before confirming the deletion.
        setTimeout(remove, 500)

        function remove(){

          // Return if user does not confirm deletion.
          if (!confirm('Delete Geometry?')) return;

          // Set newValue to null in order update location field in database.
          entry.newValue = null

          // Must be removed prior to database update / re-render.
          if (entry.L) {
            entry.location.layer.mapview.Map.removeLayer(entry.L)
            delete entry.L
          }
          
          // Re-renders location view after database update.
          entry.location.update()
        }

      }}>Delete Geometry`)

  const icon = entry.style && mapp.utils.html`
    ${mapp.ui.elements.legendIcon(
      Object.assign({ width: 24, height: 24 }, entry.style)
    )}`;

  if (list.length > 0) {

    // Return drawer with list elements to entry node.
    return mapp.ui.elements.drawer({
      data_id: `draw-drawer`,
      header: mapp.utils.html`
        ${chkbox}
        <div class="mask-icon expander"></div>
        ${icon}`,
      content: mapp.utils.html`
        ${list}`,
    })

  }

  // Return checkbox only if list is empty.
  return mapp.utils.html.node`<div class="flex-spacer">${chkbox}${icon}`
}

// Method to toggle the entry's geometry display.
function show() {

  this.display = true

  const chkbox = this.location
    .view?.querySelector(`[data-id=${this.field}-chkbox] input`)
  
  if (chkbox) chkbox.checked = true
    
  if (this.L) {

    // Remove existing layer to prevent assertion error.
    this.location.layer.mapview.Map.removeLayer(this.L)
    delete this.L
  }

  // Create new geometry layer from entry value
  this.L = this.location.layer.mapview.geoJSON({
    zIndex: this.zIndex || 99,
    geometry: this.value,
    Style: this.Style,
    dataProjection: this.srid || this.location?.layer?.srid
  })

  // Removes layer from mapview when location is removed.
  this.location.Layers.push(this.L)
}

// Method for button element to call modify interaction.
function modify(e, entry) {

  const btn = e.target

  // Check whether to cancel interaction.
  if (btn.classList.contains('active')) {

    // Cancel modify interaction.
    btn.classList.remove('active')
    entry.mapview.interactions.highlight()
    return;
  }

  btn.classList.add('active')

  // Tick display checkbox if not already set.
  !entry.display && entry.show()

  // Remove existing entry geometry layer.
  entry.location.layer.mapview.Map.removeLayer(entry.L)

  const feature = entry.L.getSource().getFeatures()[0]

  entry.mapview.interactions.modify({
    Feature: feature.clone(),
    layer: entry.location.layer,
    snap: entry.edit.snap,
    srid: entry.srid || entry.location.layer.srid,
    callback: feature => {

      // Reset interaction and button
      btn.classList.remove('active')

      // Set highlight interaction if no other interaction is current after 400ms.
      setTimeout(() => {
        !entry.mapview.interaction && entry.mapview.interactions.highlight()
      }, 400)

      // The callback returns a feature as geojson.
      if (feature) {

        // Assign feature geometry as new value.
        entry.newValue = feature.geometry
        entry.location.update()
        return;
      }

      // Add original layer back with no new feature geometry returned from draw interaction.
      entry.location.layer.mapview.Map.addLayer(entry.L)
    }
  })
}