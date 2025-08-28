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
@requires /ui/elements/chkbox
@requires /ui/elements/helpDialog
@requires /ui/elements/drawing

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
@property {location} entry.location The entry location.
@property {boolean} [entry.display=false] Whether the geometry should be displayed in the mapview.
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
  entry.mapview ??= entry.location.layer.mapview;

  if (typeof entry.value === 'string') {
    // Parse string value as JSON.
    entry.value = JSON.parse(entry.value);
  }

  entry.srid ??= entry.location.layer.srid;
  entry.zIndex ??= entry.location.layer.zIndex + 1 || 99;

  // Should be false if nullish.
  entry.display ??= false;

  // Drawing is only available within an edit context.
  if (entry.edit?.draw) {
    entry.draw = entry.edit.draw;
  }

  // Editing with drawing is toggled off.
  if (entry._edit?.draw) delete entry.draw;

  // Return if entry has no geometry value and cannot be drawn in to.
  if (!entry.value && !entry.draw && !entry.api) {
    entry.location.removeLayer(entry);
    return;
  }

  if (entry.style !== null) {
    // Assign entry.style to location.style. Allow for `style: {}` to apply no styling
    entry.style = { ...entry.location.style, ...entry.style };

    // Create ol style from entry.style if not yet defined.
    entry.Style ??= mapp.utils.style(entry.style);
  }

  entry.show ??= show;
  entry.hide ??= hide;
  entry.getExtent ??= getExtent;
  entry.modify ??= modify;
  entry.label ??= 'Geometry';
  entry.disabled ??= !entry.value && !entry.api;

  // Create checkbox to control geometry display.
  entry.chkbox = mapp.ui.elements.chkbox({
    checked: entry.display,
    data_id: `chkbox-${entry.key}`,
    disabled: entry.disabled,
    label: entry.label,
    onchange: (checked) => {
      checked ? entry.show() : entry.hide();
    },
  });

  if (!Array.isArray(entry.elements)) {
    entry.elements = entry.api_elements || [];

    draw(entry);

    edit(entry);
  }

  if (!entry.edit) delete entry.elements;

  const icon = mapp.ui.elements.legendIcon({
    height: 24,
    width: 24,
    ...entry.style,
  });

  entry.display && entry.show();

  return mapp.utils.html.node`
    <div class="flex-spacer">${entry.chkbox}${icon}</div>
    ${entry.elements}`;
}

/**
@function getExtent
@this infoj-entry

@description
Returns the extent of the geometry. 

@returns {Array} an array representing an openlayers extent
*/
function getExtent() {
  if (!this.display) return;
  if (!this.L) return;
  return this.L.getSource().getExtent();
}

/**
@function show
@async
@this infoj-entry

@description
The show method is bound to the geometry type making this the entry object.

The show method sets the entry.display flag and associated checkbox element status true.

A geometry can be requested from an entry.api() method if no geometry entry.value is present.

An existing OL vector layer entry.L will be removed from the mapview and deleted.

A new OL vector layer entry.L will be created and added to the mapview.
*/
async function show() {
  if (this.disabled) return;

  this.location.removeLayer(this);

  this.display = true;

  const chkbox = this.chkbox?.querySelector('input');

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

  // An ol layer L can only be created with a value.
  if (!this.value) return;

  // Create new geometry layer from entry value
  this.L = this.location.layer.mapview.geometry(this);

  this.location.Layers.push(this);
}

/**
@function hide
@this infoj-entry

@description
Removes the entry.L from the location.layer.mapview. 
*/
function hide() {
  this.display = false;

  this.location.removeLayer(this);
}

/**
@function edit
@description
The edit method will push elements for geometry edits into the entry.elements array.

@param {infoj-entry} entry type:geometry entry.
@property {Object} [entry.edit] editing must be configured for the geometry entry.
@property {string} [entry.edit.modify_label] label for the modify button. If not defined, defaults to dictionary term.
@property {string} [entry.edit.delete_label] label for the delete button. If not defined, defaults to dictionary term.
@property {boolean} [entry.edit.delete] flag to enable delete button. Without it, only the modify button will be shown.
@property {Object} [entry.value] entry must have a geometry value to be editable.
*/
function edit(entry) {
  if (!entry.edit) return;

  // Editing requires a value to be edited.
  if (!entry.value) return;

  entry.edit.modify_label ??= mapp.dictionary.modify_geometry;

  entry.edit.modify_btn = mapp.utils.html.node`
    <button
      class="action wide"
      data-id="modify-btn"
      onclick=${() => {
        if (entry.edit.modify_btn.classList.toggle('active')) {
          entry.modify();
        } else {
          entry.location.layer.mapview.interactions.highlight();
        }
      }}>
      <span class="notranslate material-symbols-outlined">format_shapes</span>
      ${entry.edit.modify_label}`;

  entry.elements.push(entry.edit.modify_btn);

  entry.edit.delete_label ??= mapp.dictionary.delete_geometry;

  // Delete is only shown if edit.delete flag is provided.
  entry.edit.delete &&
    entry.elements.push(mapp.utils.html`<button class="action wide"
    onclick=${() => deleteGeometry(entry)}>
    <span class="notranslate material-symbols-outlined color-danger">ink_eraser</span>
    <span style="color: var(--color-danger)">${entry.edit.delete_label}</span>`);
}

/**
@function deleteGeometry
@async

@description
The method will check whether unsaved changes should be saved. The method will return if the confirm dialog is cancelled.

Without unsaved changes the geometry will be deleted and the location will be updated.

All unsaved changes will be confirmed and the geometry will be deleted otherwise.

@param {infoj-entry} entry type:geometry entry.
*/
async function deleteGeometry(entry) {
  const confirmUpdate = await entry.location.confirmUpdate(deleteUpdate);

  if (confirmUpdate === null) {
    return;
  }

  deleteUpdate();

  function deleteUpdate() {
    entry.display = false;
    entry.newValue = null;
    entry.location.update(renderLocationView);
  }

  function renderLocationView() {
    delete entry.elements;
    entry.location.renderLocationView();
  }
}

/**
@function modify
@async
@this infoj-entry

@description
The modify method will toggle a mapview modify interaction for the entry geometry.

The entry.show() method will be called prior to the modify interaction.
*/
async function modify() {
  const entry = this;

  const confirmUpdate = await entry.location.confirmUpdate(() => {
    entry.location.renderLocationView();
  });

  if (confirmUpdate === null) {
    entry.edit.modify_btn.classList.remove('active');
    return;
  }

  const helpDialog = {
    content: mapp.utils.html.node`<li>
      <ul>${mapp.dictionary.edit_dialog_cancel_drawing}
      <ul>${mapp.dictionary.edit_dialog_remove_vertex}</ul>
      <ul>${mapp.dictionary.edit_dialog_modify_shape}</ul>
      <ul>${mapp.dictionary.edit_dialog_save}</ul>`,
    header: mapp.utils.html`<h3>${mapp.dictionary.edit_dialog_title}</h3>`,
  };

  mapp.ui.elements.helpDialog(helpDialog);

  !entry.display && entry.show();

  // Remove existing entry geometry layer.
  entry.location.layer.mapview.Map.removeLayer(entry.L);

  const Feature = entry.L.getSource().getFeatures()[0].clone();

  entry.location.layer.mapview.interactions.modify({
    Feature,
    layer: entry.location.layer,
    snap: entry.edit.snap,
    srid: entry.srid,
    callback: (feature) => {
      entry.edit.modify_btn.classList.remove('active');
      updateCallback(feature, entry);
    },
  });
}

/**
@function draw

@description
The draw method push drawing interface elements to the entry.elements[] array.

@param {infoj-entry} entry type:geometry entry.
*/
function draw(entry) {
  if (!entry.draw) return;

  Object.keys(entry.draw).forEach((key) => {
    if (entry.draw[key] === true) {
      entry.draw[key] = {};
    }

    if (mapp.ui.elements.drawing[key]) {
      entry.draw[key].callback ??= (feature) => {
        entry.draw[key].btn.classList.remove('active');
        updateCallback(feature, entry);
      };

      const el = mapp.ui.elements.drawing[key](entry);

      entry.elements.push(el);
    }
  });
}

/**
@function updateCallback

@description
The updateCallback method is passed as callback method for the drawing or modify interactions.

@param {object} feature The feature returned from modify or drawing interaction.
@param {infoj-entry} entry type:geometry entry.
*/
function updateCallback(feature, entry) {
  delete entry.mapview.interaction;
  mapp.ui.elements.helpDialog();

  if (!feature) {
    // Set highlight interaction if no other interaction is current after 400ms.
    setTimeout(() => {
      !entry.mapview.interaction && entry.mapview.interactions.highlight();
    }, 400);
    entry.location.renderLocationView();
    return;
  }

  entry.newValue = feature.geometry;

  // Location will stay editable after update.
  entry.location.update(renderLocationView);

  function renderLocationView() {
    delete entry.elements;
    entry.location.renderLocationView();
  }
}
