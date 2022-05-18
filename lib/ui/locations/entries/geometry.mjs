export default entry => {

  entry.value = typeof entry.value === 'string' && JSON.parse(entry.value)
    || entry.value

  // Turn off display with no geometry to display.
  entry.display = (entry.display && entry.value)

  // Return if entry has no geometry value and is not editable.
  if (!entry.value && !entry.edit) return;

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

  // Options for edit and modifying methods.
  const options = {
    entry,
    layer: entry.location.layer,
    srid: entry.srid || entry.location.srid,
    edit: entry.edit,
    mapview: entry.location.layer.mapview,
  };

  // Push elements for drawing methods into list.
  const list = typeof entry.edit === 'object' && Object.keys(entry.edit)
    .map(key => mapp.ui.elements.drawing[key] && mapp.ui.elements.drawing[key](options, draw))
    .filter(node => !!node)

  // Push modify button into list.
  entry.edit?.geometry && list.push(mapp.utils.html`
    <button
      class="flat wide primary-colour"
      onclick=${e=>modify(e, options)}>
      Modify Geometry`)

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
          options.entry.location.update()
        }

      }}>Delete Geometry`)

  const icon = entry.style && mapp.utils.html`
    ${mapp.ui.elements.legendIcon(
      Object.assign({ width: 24, height: 24 }, entry.style)
    )}`;

  if (list) {

    // Return drawer with list elements to entry node.
    return mapp.ui.elements.drawer({
      class: 'lv-2 flat',
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
    zIndex: this.zIndex,
    geometry: this.value,
    Style: this.Style,
    dataProjection: this.srid || this.location?.layer?.srid
  })

  // Removes layer from mapview when location is removed.
  this.location.Layers.push(this.L)
}

// Method for button element to call draw interaction with options.
function draw(e, options) {

  // Get button from event target.
  const btn = e.target

  // Check whether to cancel interaction.
  if (btn.classList.contains('active')) {
    btn.classList.remove('active')

    // Begin highlight interaction on mapview.
    // Cancels current interaction.
    options.mapview.interactions.highlight()
    return;
  }

  btn.classList.add('active')

  // Tick display checkbox if not already set.
  !options.entry.display && options.entry.show()

  // Remove existing entry geometry layer.
  options.entry.L
    && options.entry.location.layer.mapview.Map.removeLayer(options.entry.L)

  options.mapview.interactions.draw({
    type: options.type,
    geometryFunction: options.geometryFunction,
    tooltip: options.tooltip,
    srid: options.srid,
    callback: feature => {

      // Reset interaction and button
      btn.classList.remove('active')
      options.mapview.interactions.highlight()

      // The callback returns a feature as geojson.
      if (feature) {

        // Assign feature geometry as new value.
        options.entry.newValue = feature.geometry
        options.entry.location.update()
        return;
      }

      // Add original layer back with no new feature geometry returned from draw interaction.
      options.entry.L
        && options.entry.location.layer.mapview.Map.addLayer(options.entry.L)

    }
  })
}

// Method for button element to call modify interaction with options.
function modify(e, options) {

  const btn = e.target

  // Check whether to cancel interaction.
  if (btn.classList.contains('active')) {
    btn.classList.remove('active')

    // Begin highlight interaction on mapview.
    // Cancels current interaction.
    options.mapview.interactions.highlight()
    return;
  }

  btn.classList.add('active')

  // Tick display checkbox if not already set.
  !options.entry.display && options.entry.show()

  // Remove existing entry geometry layer.
  options.entry.location.layer.mapview.Map.removeLayer(options.entry.L)

  const feature = options.entry.L.getSource().getFeatures()[0]

  options.mapview.interactions.modify({
    Feature: feature.clone(),
    snapLayer: options.entry.location.layer,
    callback: feature => {

      // Reset interaction and button
      btn.classList.remove('active')
      options.mapview.interactions.highlight()

      // The callback returns a feature as geojson.
      if (feature) {

        // Assign feature geometry as new value.
        options.entry.newValue = feature.geometry
        options.entry.location.update()
        return;
      }

      // Add original layer back with no new feature geometry returned from draw interaction.
      options.entry.location.layer.mapview.Map.addLayer(options.entry.L)
    }
  })
}