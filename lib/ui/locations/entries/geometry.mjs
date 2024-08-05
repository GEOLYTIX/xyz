/**
## ui/locations/entries/geometry

The geometry entry module exports a default entry method to process infoj entries with a geometry value.

### mapp.ui.locations.entries.geometry(entry)

@module /ui/locations/entries/geometry
*/

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

/**
@function geometry

@description
The geometry method will create an OL entry.Style object from the entry.style JSON. If undefined the entry.location.Style will be assigned.

The entry will be decorated with a show() method if not implicit.

By default a checkbox element will be returned which can trigger the show method or will hide the geometry in the mapview if toggled off.

Drawing elements will be displayed in the entry.node for the entry.draw{} configuration.

The draw object can be nested within the entry.edit{} configuration object. In this case the edit and draw elements will only be visible if editing is enabled for the location.

A vector layer entry.L will be created to render a style feature for the geometry entry in the entry.mapview.

@param {Object} entry type:geometry entry.
@param {boolean} entry.display Whether the geometry should be displayed in the mapview.
@param {Object} entry.value geometry as JSON value.
@param {Object} entry.style MAPP style configuration.
@param {string} [entry.format='GeoJSON'] format for entry.value geometry.
@param {Object} [entry.edit] configuration object for editing the geometry.
@param {Object} [entry.draw] configuration object for mapview draw interaction.
@param {Funcion} [entry.api] Method to request geometry from an external API.
@return {HTMLElement} elements for the location view.
*/

export default function geometry(entry) {

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

  // Assign entry.style to location.style if entry.style is not an empty object.
  if (entry.style && Object.keys(entry.style).length) {
    entry.style = { ...entry.location?.style, ...entry.style }
  }
  
  // Create ol style from entry.style if not yet defined.
  entry.Style ??= mapp.utils.style(entry.style)

  // Assign method to show geometry in mapview.
  entry.show ??= show

  entry.modify ??= modify

  entry.label ??= 'Geometry'

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    label: entry.label,
    data_id: `chkbox-${entry.key}`,
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

/**
### entry.show(entry)

The show method will set the entry.display flag and associated checkbox element status true.

A geometry can be requested from an entry.api() method if no geometry entry.value is present.

An existing OL vector layer entry.L will be from the mapview removed and deleted.

A new OL vector layer entry.L will be created from the entry.value geometry and added to the mapview.

@function show
@param {Object} [entry=this] type:geometry entry.
@param {Object} entry.value geometry as JSON value.
@param {Object} entry.Style OL style object.
@param {string} [entry.format='GeoJSON'] format for entry.value geometry.
@param {Funcion} [entry.api] Method to request geometry from an external API.
*/

// Method to toggle the entry's geometry display.
async function show() {

  this.display = true

  // the show event maybe triggered by an API, draw, or modify interaction.
  const chkbox = this.location.view?.querySelector(`[data-id=chkbox-${this.key}] input`)

  if (chkbox) chkbox.checked = true

  if (!this.value && this.api) {

    // Disable location view while awaiting API response.
    this.blocking && this.location.view?.classList.add('disabled')

    await this.api(this)
  }

  if (this.L) {

    // Remove existing layer to prevent assertion error.
    this.location.layer.mapview.Map.removeLayer(this.L)
    delete this.L
  }

  // Create new geometry layer from entry value
  this.L = this.location.layer.mapview.geometry(this)

  // Removes layer from mapview when location is removed.
  this.location.Layers.push(this.L)
}

/**
### edit(entry)

The edit method will push elements for geometry edits into the entry.elements array.

@function edit
@param {Object} [entry] type:geometry entry.
@param {Object} [entry.edit] editing must be configured for the geometry entry.
@param {Object} [entry.value] entry must have a geometry value to be editable.
*/

function edit(entry) {

  if (!entry.edit) return;

  // Editing requires a value to be edited.
  if (!entry.value) return;

  if (entry.field !== entry.location.layer.geomCurrent())

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
    ${entry.edit.delete_label || mapp.dictionary.delete_geometry}`)

  entry.elements.push(mapp.utils.html.node`
    <button
      class="flat bold wide primary-colour modify-btn"
      onclick=${()=>entry.modify()}>
      ${entry.edit.modify_label || mapp.dictionary.modify_geometry}`)
}

/**
### entry.modify()

The modify method will toggle a mapview modify interaction for the entry geometry.

The entry.show() method will be called prior to the modify interaction.

@function modify
@param {Object} [entry] type:geometry entry.
@param {Object} [entry.value] entry must have a geometry value to be editable.
*/

// Method for button element to call modify interaction.
function modify(entry=this) {

  // the modify event maybe triggered by an API.
  const btn = this.location.view?.querySelector('.modify-btn')

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

/**
### draw(entry)

The draw method push drawing interface elements to the entry.elements[] array.

@function draw
@param {Object} [entry] type:geometry entry.
*/

// Method for button element to call draw interaction.
function draw(entry) {

  // Short circuit without an entry.draw config.
  if (!entry.draw) return;

  Object.keys(entry.draw).forEach(key => {

    if (entry.draw[key] === true) {
      entry.draw[key] = {}
    }

    if (mapp.ui.elements.drawing[key]) {

      entry.draw[key].callback ??= drawCallback

      entry.elements.push(mapp.ui.elements.drawing[key](entry))
    }
  })

  function drawCallback(feature){

    if (!feature) return;

    // Assign feature geometry as new value.
    entry.value = feature.geometry

    update(entry)
  }
}

/**
### update(entry)

The update method will update the geometry entry.value in the location data at rest.

Update depedents and the location view.

@function update
@param {Object} [entry] type:geometry entry.
*/

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
