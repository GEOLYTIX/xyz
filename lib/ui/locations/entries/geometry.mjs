mapp.utils.merge(mapp.dictionaries, {
  en: {
    delete_geometry: 'Delete Geometry',
    modify_geometry: 'Modify Geometry',
  },
  de: {
    delete_geometry: 'Geometrie entfernen',
    modify_geometry: 'Geometrie bearbeiten',
  },
  zh: {
    delete_geometry: '删除图形',
  },
  zh_tw: {
    delete_geometry: '刪除圖形',
  },
  pl: {
    delete_geometry: 'Usuń geometrię',
  },
  fr: {
    delete_geometry: 'Effacer la Géométrie',
  },
  ja: {
    delete_geometry: 'ジオメトリーを削除',
  },
  es: {
    delete_geometry: 'Eliminar geometría',
  },
  tr: {
    delete_geometry: 'Geometriyi sil',
  },
  it: {
    delete_geometry: 'Elima geometria',
  },
  th: {
    delete_geometry: 'ลบรูปทรงเรขาคณิต',
  },
})

export default entry => {

  entry.format ??= 'GeoJSON'

  // Assigning the mapview to the entry makes the entry behave like a layer object for draw and modify interactions.
  entry.mapview ??= entry.location?.layer?.mapview

  // The geometry value must be JSON.
  entry.value = typeof entry.value === 'string' ?
    JSON.parse(entry.value) : entry.value

  entry.srid ??= entry.location?.layer?.srid

  entry.zIndex ??= entry.location?.layer?.zIndex || 99

  // Drawing is only available within an edit context.
  if (entry.edit?.draw) {

    entry.draw = entry.edit.draw
  }

  // Editing with drawing is toggled off.
  if (entry._edit?.draw) delete entry.draw

  // Return if entry has no geometry value and cannot be drawn in to.
  if (!entry.value && !entry.draw && !entry.api) return;

  // Assign [OL] Style if not already assigned.
  entry.Style ??= typeof entry.style === 'object' ?
    mapp.utils.style(entry.style) : entry.location.Style

  // Assign method to show geometry in mapview.
  entry.show ??= show

  entry.label ??= 'Geometry'

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    label: entry.label,
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,

    // API entries will not be disabled without a value.
    disabled: entry.disabled || (!entry.value && !entry.api),
    onchange: (checked) => {

      // Show geometry of checked.
      if (checked) return entry.show();

      // Remove the geometry layer from map.
      entry.display = false
      entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L)
    }
  })

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  entry.elements = entry.api_elements || []

  // Call the draw method 
  draw(entry);

  edit(entry);

  const icon = entry.style && mapp.utils.html`
    ${mapp.ui.elements.legendIcon(
    Object.assign({ width: 24, height: 24 }, entry.style)
  )}`;

  // Return checkbox only.
  return mapp.utils.html.node`
    <div class="flex-spacer">${entry.chkbox}${icon}</div>
    ${entry.elements}`
}

// Method to toggle the entry's geometry display.
function show() {

  this.display = true

  // the show event maybe triggered by an API, draw, or modify interaction.
  const chkbox = this.location.view?.querySelector(`[data-id=${this.field}-chkbox] input`)

  if (chkbox) chkbox.checked = true

  if (!this.value && this.api) {

    this.api(this)
    return
  }

  if (this.L) {

    // Remove existing layer to prevent assertion error.
    this.location.layer.mapview.Map.removeLayer(this.L)
    delete this.L
    delete this.geometry
  }

  // Create new geometry layer from entry value
  this.L = this.location.layer.mapview.geometry(this)

  // Removes layer from mapview when location is removed.
  this.location.Layers.push(this.L)
}

function edit(entry) {

  if (!entry.edit) return;

  // Editing requires a value to be edited.
  if (!entry.value) return;

  entry.elements.push(mapp.utils.html`
    <button
      class="flat wide no-colour"
      onclick=${() => {

        // Set value to null and update.
        entry.location.layer.mapview.interaction.finish()
        entry.display = false
        entry.value = null
        update(entry)
    }}>
    ${mapp.dictionary.delete_geometry}`)

  entry.elements.push(mapp.utils.html.node`
    <button
      class="flat bold wide primary-colour"
      onclick=${e => modify(e, entry)}>
      ${mapp.dictionary.modify_geometry}`)
}

// Method for button element to call modify interaction.
function modify(e, entry) {

  const btn = e.target

  // Check whether to cancel interaction.
  if (btn.classList.contains('active')) {

    // Cancel modify interaction.
    entry.location.layer.mapview.interactions.highlight()
    return;
  }

  btn.classList.add('active')

  // Tick display checkbox if not already set.
  !entry.display && entry.show()

  // Remove existing entry geometry layer.
  entry.location.layer.mapview.Map.removeLayer(entry.L)

  const feature = entry.L.getSource().getFeatures()[0]

  entry.location.layer.mapview.interactions.modify({
    Feature: feature.clone(),
    layer: entry.location.layer,
    snap: entry.edit.snap,
    srid: entry.srid || entry.location.layer.srid,
    callback: feature => {

      // Reset interaction and button
      btn.classList.remove('active')

      delete entry.location.layer.mapview.interaction

      // Set highlight interaction if no other interaction is current after 400ms.
      setTimeout(() => {
        !entry.location.layer.mapview.interaction && entry.location.layer.mapview.interactions.highlight()
      }, 400)

      // The callback returns a feature as geojson.
      if (feature) {

        // Assign feature geometry as new value.
        entry.value = feature.geometry
      
        update(entry)
      } else {

        // Add original layer back with no new feature geometry returned from draw interaction.
        entry.location.layer.mapview.Map.addLayer(entry.L)
      }
    }
  })
}

// Method for button element to call draw interaction.
function draw(entry) {

  // Short circuit without an entry.draw config.
  if (!entry.draw) return;

  entry.draw.callback = feature => {

    if (!feature) return;

    // Assign feature geometry as new value.
    entry.value = feature.geometry

    update(entry)
  }

  Object.keys(entry.draw).forEach(key => {

    if (mapp.ui.elements.drawing[key]) {
      entry.elements.push(mapp.ui.elements.drawing[key](entry))
    }
  })
}

async function update(entry) {

  if (entry.L) {

    // Remove existing entry geometry layer.
    entry.location.layer.mapview.Map.removeLayer(entry.L)

    delete entry.L
  }

  entry.location.view?.classList.add('disabled')

  // Update the geometry field value.
  await mapp.utils.xhr({
    method: 'POST',
    url:
      `${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'location_update',
        locale: entry.location.layer.mapview.locale.key,
        layer: entry.location.layer.key,
        table: entry.location.table,
        id: entry.location.id,
      }),
    body: JSON.stringify({ [entry.field]: entry.value }),
  })

  if (entry.dependents) {
    await entry.location.syncFields(entry.dependents)
  }

  if (entry.location.layer.geom === entry.field) {

    // Reload the layer if the layers geom field has been updated.
    entry.location.layer.reload()
  }

  entry.location.viewEntries.remove()
  entry.location.view?.classList.remove('disabled')
  entry.location.viewEntries = entry.location.view.appendChild(mapp.ui.locations.infoj(entry.location))
}
