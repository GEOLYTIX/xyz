/**
## ui/locations/entries/geometry

The geometry entry module exports a default entry method to process infoj entries with a geometry value.

Dictionary entries:
- delete_geometry
- modify_geometry
- edit_dialog_title
- edit_dialog_cancel_drawing
- edit_dialog_remove_vertex
- edit_dialog_modify_shape
- edit_dialog_save

@requires /dictionary 

@requires /utils/olStyle

@module /ui/locations/entries/geometry
*/

/**
@function geometry

@description
The geometry method will create an OL entry.Style object from the entry.style{} spread into the location.style{}. The geometry will not be rendered with entry.style null.

The entry will be decorated with a show() method if not implicit.

By default a checkbox element will be returned which can trigger the show method or will hide the geometry in the mapview if toggled off.

Drawing elements will be displayed in the entry.node for the entry.draw{} configuration.

The draw object can be nested within the entry.edit{} configuration object. In this case the edit and draw elements will only be visible if editing is enabled for the location.

A vector layer entry.L will be created to render a style feature for the geometry entry in the entry.mapview.

@param {infoj-entry} entry type:geometry entry.
@property {boolean} entry.display Whether the geometry should be displayed in the mapview.
@property {Object} entry.value geometry as JSON value.
@property {Object} entry.style MAPP style configuration.
@property {string} [entry.format='GeoJSON'] format for entry.value geometry.
@property {Object} [entry.edit] configuration object for editing the geometry.
@property {Object} [entry.draw] configuration object for mapview draw interaction.
@property {Function} [entry.api] Method to request geometry from an external API.

@return {HTMLElement} elements for the location view.
*/
export default function geometry(entry) {
  entry.format ??= 'GeoJSON';

  // Assigning the mapview to the entry makes the entry behave like a layer object for draw and modify interactions.
  entry.mapview ??= entry.location?.layer?.mapview;

  // The geometry value must be JSON.
  entry.value =
    typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value;

  entry.srid ??= entry.location?.layer?.srid;

  entry.zIndex ??= entry.location?.layer?.zIndex + 1 || 99;

  // Drawing is only available within an edit context.
  if (entry.edit?.draw) {
    entry.draw = entry.edit.draw;
  }

  // Editing with drawing is toggled off.
  if (entry._edit?.draw) delete entry.draw;

  // Return if entry has no geometry value and cannot be drawn in to.
  if (!entry.value && !entry.draw && !entry.api) {
    // An existing layer should be removed for null value entries.
    entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L);
    return;
  }

  if (entry.style !== null) {
    // Assign entry.style to location.style. Allow for `style: {}` to apply no styling
    entry.style = { ...entry.location?.style, ...entry.style };

    // Create ol style from entry.style if not yet defined.
    entry.Style ??= mapp.utils.style(entry.style);
  }

  // Bind the show method to entry.
  entry.show ??= show;

  // Bind the modify method to entry.
  entry.modify ??= modify;

  entry.label ??= 'Geometry';

  // Show geometry if entry is set to display.
  entry.display && entry.show();

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    checked: !!entry.display,
    data_id: `chkbox-${entry.key}`,
    disabled: entry.disabled || (!entry.value && !entry.api),

    // API entries will not be disabled without a value.
    label: entry.label,
    onchange: (checked) => {
      // Show geometry of checked.
      if (checked) return entry.show();

      // Remove the geometry layer from map.
      entry.display = false;
      entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L);

      //Remove the extent function from the Extents
      delete entry.location.Extents[entry.key];
    },
  });

  entry.elements = entry.api_elements || [];

  // Call the draw method
  draw(entry);

  edit(entry);

  const icon = mapp.utils.html`
    ${mapp.ui.elements.legendIcon({
      height: 24,
      width: 24,
      ...entry.style,
    })}`;

  //Add a getExtent function to the entry
  entry.getExtent = () => getExtent(entry);

  // Return checkbox only.
  return mapp.utils.html.node`
    <div class="flex-spacer">${entry.chkbox}${icon}</div>
    ${entry.elements}`;
}

/**
@function getExtent

@description
Returns the extent of the geometry. 

@property {infoj-entry}
@returns {Array} an array representing an openlayers extent
*/
async function getExtent(entry) {
  if (!entry.L) return;
  return entry.L.getSource().getExtent();
}

/**
@function show

@description
The show method is bound to the geometry type making this the entry object.

The show method sets the entry.display flag and associated checkbox element status true.

A geometry can be requested from an entry.api() method if no geometry entry.value is present.

An existing OL vector layer entry.L will be removed from the mapview and deleted.

A new OL vector layer entry.L will be created and added to the mapview.

@this infoj-entry
*/
async function show() {
  // Do not show the geometry if the entry has been disabled.
  if (this.disabled) return;

  this.display = true;

  // the show event maybe triggered by an API, draw, or modify interaction.
  const chkbox = this.location.view?.querySelector(
    `[data-id=chkbox-${this.key}] input`,
  );

  if (chkbox) chkbox.checked = true;

  if (!this.value && this.api) {
    // Disable location view while awaiting API response.
    this.blocking && this.location.view?.classList.add('disabled');

    await this.api(this);

    // A value will not be assigned if the api method request fails.
    if (!this.value) {
      this.disabled = true;
    }
  }

  if (this.L) {
    this.location.layer.mapview.Map.removeLayer(this.L);

    // Layer object must be filtered from the Layers array before being deleted.
    this.location.Layers = this.location.Layers.filter(
      (L) => L.ol_uid !== this.L.ol_uid,
    );

    delete this.L;
  }

  // An ol layer L can only be created with a value.
  if (!this.value) return;

  // Create new geometry layer from entry value
  this.L = this.location.layer.mapview.geometry(this);

  // Removes layer from mapview when location is removed.
  this.location.Layers.push(this.L);

  //Add the extent function to the location
  this.location.Extents[this.key] = async () => await this.getExtent();
}

/**
@function edit
@description
The edit method will push elements for geometry edits into the entry.elements array.

@param {infoj-entry} entry type:geometry entry.
@property {Object} [entry.edit] editing must be configured for the geometry entry.
@property {Object} [entry.value] entry must have a geometry value to be editable.
*/

function edit(entry) {
  if (!entry.edit) return;

  // Editing requires a value to be edited.
  if (!entry.value) return;

  if (entry.field !== entry.location.layer.geomCurrent())
    entry.elements.push(mapp.utils.html`
    <button
      class="flat wide color-danger"
      onclick=${() => {
        // Set value to null and update.
        entry.display = false;
        entry.value = null;
        update(entry);
      }}>
    ${entry.edit.delete_label || mapp.dictionary.delete_geometry}`);

  entry.elements.push(mapp.utils.html.node`
    <button
      class="action wide"
      data-id="modify-btn"
      onclick=${(e) => entry.modify(e)}>
     <span class="material-symbols-outlined">format_shapes</span>
      ${entry.edit.modify_label || mapp.dictionary.modify_geometry}`);
}

/**
@function modify

@description
The modify method will toggle a mapview modify interaction for the entry geometry.

The entry.show() method will be called prior to the modify interaction.

@this infoj-entry
*/

// Method for button element to call modify interaction.
function modify(e) {
  const entry = this;

  // the modify event maybe triggered by an API.
  const btn = e.target;

  const helpDialog = {
    content: mapp.utils.html.node`<li>
      <ul>${mapp.dictionary.edit_dialog_cancel_drawing}
      <ul>${mapp.dictionary.edit_dialog_remove_vertex}</ul>
      <ul>${mapp.dictionary.edit_dialog_modify_shape}</ul>
      <ul>${mapp.dictionary.edit_dialog_save}</ul>`,
    header: mapp.utils.html`<h3>${mapp.dictionary.edit_dialog_title}</h3>`,
  };

  // Call the helpDialog
  mapp.ui.elements.helpDialog(helpDialog);

  // Check whether to cancel interaction.
  if (btn.classList.contains('active')) {
    // Cancel modify interaction.
    entry.location.layer.mapview.interactions.highlight();
    return;
  }

  btn.classList.add('active');

  // Tick display checkbox if not already set.
  !entry.display && entry.show();

  // Remove existing entry geometry layer.
  entry.location.layer.mapview.Map.removeLayer(entry.L);

  const feature = entry.L.getSource().getFeatures()[0];

  entry.location.layer.mapview.interactions.modify({
    callback: (feature) => {
      // Reset interaction and button
      btn.classList.remove('active');

      delete entry.location.layer.mapview.interaction;

      mapp.ui.elements.helpDialog();

      // Set highlight interaction if no other interaction is current after 400ms.
      setTimeout(() => {
        !entry.location.layer.mapview.interaction &&
          entry.location.layer.mapview.interactions.highlight();
      }, 400);

      // The callback returns a feature as geojson.
      if (feature) {
        // Assign feature geometry as new value.
        entry.value = feature.geometry;

        update(entry);
      } else {
        // Add original layer back with no new feature geometry returned from draw interaction.
        entry.location.layer.mapview.Map.addLayer(entry.L);
      }
    },
    Feature: feature.clone(),
    layer: entry.location.layer,
    snap: entry.edit.snap,
    srid: entry.srid || entry.location.layer.srid,
  });
}

/**
@function draw

@description
The draw method push drawing interface elements to the entry.elements[] array.

@param {infoj-entry} entry type:geometry entry.
*/
function draw(entry) {
  // Short circuit without an entry.draw config.
  if (!entry.draw) return;

  Object.keys(entry.draw).forEach((key) => {
    if (entry.draw[key] === true) {
      entry.draw[key] = {};
    }

    if (mapp.ui.elements.drawing[key]) {
      entry.draw[key].callback ??= drawCallback;

      entry.elements.push(mapp.ui.elements.drawing[key](entry));
    }
  });

  function drawCallback(feature) {
    mapp.ui.elements.helpDialog();

    if (!feature) return;

    // Assign feature geometry as new value.
    entry.value = feature.geometry;

    update(entry);
  }
}

/**
@function update

@description
The update method will update the geometry entry.value in the location data at rest.

Update depedents and the location view.

@param {infoj-entry} entry type:geometry entry.
*/
async function update(entry) {
  if (entry.L) {
    // Remove existing entry geometry layer.
    entry.location.layer.mapview.Map.removeLayer(entry.L);

    delete entry.L;
  }

  entry.location.view?.classList.add('disabled');

  // Update the geometry field value.
  await mapp.utils.xhr({
    body: JSON.stringify({ [entry.field]: entry.value }),
    method: 'POST',
    url:
      `${entry.location.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        id: entry.location.id,
        layer: entry.location.layer.key,
        locale: entry.location.layer.mapview.locale.key,
        table: entry.location.table,
        template: 'location_update',
      }),
  });

  if (entry.dependents) {
    await entry.location.syncFields(entry.dependents);
  }

  if (entry.location.layer.geom === entry.field) {
    // Reload the layer if the layers geom field has been updated.
    entry.location.layer.reload();
  }

  entry.location.viewEntries.remove();
  entry.location.view?.classList.remove('disabled');
  entry.location.viewEntries = entry.location.view.appendChild(
    mapp.ui.locations.infoj(entry.location),
  );
}
