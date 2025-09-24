/**
## /ui/locations/view

The module exports a default method to create a location view to be added to a locations listview.

Dictionary entries:
- location_zoom
- location_save
- location_delete
- location_remove
- location_close_without_save
- location_save_changes
@requires /dictionary 

@module /ui/locations/view
*/

/**
@function view

@description
The view method creates a location view element group.

@param {location} location A mapp location object.
@property {Object} location.record A location is stored in a record object in the mapview.locations object.
@property {Array} [location.removeCallbacks] An array of methods which will be executed when a location is removed.

@returns {HTMLElement} The location.view element.
*/
export default function view(location) {
  location.removeCallbacks?.push(function () {
    location.view.remove();
  });

  // Header with expander icon.
  const header = [
    mapp.utils.html`<h2>${location.record.symbol}`,
    mapp.utils.html`<div class="notranslate material-symbols-outlined caret"/>`,
  ];

  // Zoom to location bounds.
  if (
    location.infoj
      .filter((entry) => new Set(['pin', 'geometry']).has(entry.type))
      .some((entry) => !!entry.value)
  ) {
    header.push(mapp.utils.html`<button
      title = ${mapp.dictionary.location_zoom}
      class = "notranslate material-symbols-outlined"
      onclick = ${() => location.flyTo()}>search`);
  }

  if (toggleLocationViewEdits(location)) {
    // Toggling locationViewEdits are enabled.
    header.push(location.editToggle);
  }

  // Update icon.
  header.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_save}
    class="btn-save notranslate material-symbols-outlined color-info"
    style="display: none;"
    onclick = ${() => {
      location.view.classList.add('disabled');
      location.update();
    }}>cloud_upload`);

  // The updateInfo event must be called after the editToggle callback.
  location.updateCallbacks?.push(function () {
    location.view.dispatchEvent(new Event('updateInfo'));
  });

  // Trash icon.
  if (location.layer?.edit?.delete || location.layer?.deleteLocation) {
    header.push(mapp.utils.html`<button
      title=${mapp.dictionary.location_delete}
      class="notranslate material-symbols-outlined color-danger"
      onclick = ${() => location.trash()}>delete`);
  }

  // Clear selection.
  header.push(mapp.utils.html`<button
    title=${mapp.dictionary.location_remove}
    class="notranslate material-symbols-outlined"
    onclick=${location_remove}>close</button>`);

  /**
  @function location_remove
  @async

  @description
  The method checks whether a location.infoj has some unsaved changes. A confirm dialog will be shown to confirm the location.remove() without saving changes.
  */
  async function location_remove() {
    const changesUnsaved = location.infoj.some(
      (entry) => typeof entry.newValue !== 'undefined',
    );

    if (changesUnsaved) {
      const confirm = await mapp.ui.elements.confirm({
        text: mapp.dictionary.location_close_without_save,
      });

      if (!confirm) return;
    }

    location.remove();
  }

  location.view = mapp.ui.elements.drawer({
    class: 'location-view raised expanded',
    header: header,
  });

  location.viewEntries = location.view.appendChild(
    mapp.ui.locations.infoj(location),
  );

  // Assign location.record.colour as border to the location.view header.
  location.view.querySelector('.header').style.borderBottom =
    `3px solid ${location.record.colour}`;

  // Add listener for custom valChange event.
  location.view.addEventListener('valChange', valChange);

  location.renderLocationView = renderLocationView;

  location.view.addEventListener('render', () => location.renderLocationView());

  location.view.addEventListener('updateInfo', () => {
    // Location has toggle editing.
    if (location.editToggle) {
      location.editToggle.classList.remove('toggle-on');

      // Remove edits from infoj entries.
      location.removeEdits();
    }

    // Refresh dataviews
    if (location.layer?.dataviews) {
      Object.values(location.layer.dataviews).forEach((dv) => {
        if (dv.display === true) {
          dv.update();
        }
      });
    }

    location.renderLocationView();
  });
}

/**
@function toggleLocationViewEdits

@description
The toggleLocationViewEdits checks whether the location.layer has the toggleLocationViewEdits flag.

At least one entry of the location must be editable.

New locations must always be editable.

The location.editToggle button element for the location view header is created.

@param {location} location Mapp Location typedef

@return {Boolean} Returns true if toggleLocationViewEdits should be possible.
*/
function toggleLocationViewEdits(location) {
  if (!location.layer?.toggleLocationViewEdits) {
    // Toggle has not been set for layer.
    return false;
  }

  if (!location.infoj.some((entry) => entry.edit)) {
    // The location has no editable entries.
    return false;
  }

  // Remove edits if location is not new.
  !location.new && location.removeEdits();

  const classList = `notranslate material-symbols-outlined ${location.new ? 'toggle-on' : ''}`;

  // Create edit toggle button.
  location.editToggle = mapp.utils.html.node`<button
    title="Enable edits"
    class=${classList}
    onclick=${onClickEditToggle}>edit`;

  return true;

  /**
  @function onClickEditToggle
  @async

  @description
  The method awaits the location.confirmUpdate() method and will toggle the edit button if the response is not undefined.

  The location edits are either removed or restored depending on the toggle of the button.

  The location view must be rendered after the infoj entry edits are modified.
  
  @param {Event} e The location.editToggle onclick event.
  */
  async function onClickEditToggle(e) {
    const confirmUpdate = await location.confirmUpdate();

    if (confirmUpdate !== undefined) return;

    if (e.target.classList.toggle('toggle-on')) {
      location.restoreEdits();
    } else {
      location.removeEdits();
    }
    location.renderLocationView();
  }
}

/**
@function valChange

@description
The valChange method is assigned to the valChange custom event listener of the location.view element.

An infoj-entry must be provided as detail when the valChange custom event is dispatched.

The valChange method will check whether an entry has a newValue which is different from the current value and assign a class to show the change on the input element.

The valChange event controls the display of the location.update button (.btn-save).

The update button will not be displayed if no entry has a newValue or if some entry is invalid.

@param {Event} e A custom event from the location.view eventlistener.
@property {infoj-entry} e.detail The detail passed to the valChange event must be an info-entry typedef.
*/
function valChange(e) {
  const entry = e.detail;

  // Get location from entry
  const location = entry.location;

  if (entry.valChangeMethod instanceof Function) {
    // Execute a custom valChangeMethod.
    entry.valChangeMethod(entry);
    return;
  }

  if (entry.value != entry.newValue) {
    // newValue is different from value.
    entry.node?.classList.add('val-changed');
  } else {
    // newValue is the same as value.
    delete entry.newValue;
    entry.node?.classList.remove('val-changed');
  }

  if (location.infoj.some((entry) => entry.invalid)) {
    // Hide save button if some location entry is invalid.
    location.view.querySelector('.btn-save').style.display = 'none';
    return;
  }

  // Hide upload button if no location entry has a newValue.
  location.view.querySelector('.btn-save').style.display = location.infoj.some(
    (entry) => typeof entry.newValue !== 'undefined',
  )
    ? 'inline-block'
    : 'none';
}

/**
@function renderLocationView

@description
The renderLocationView method will remove all location.viewEntries and the `.disabled` class from the location.view before recreating the location.viewEntries and appending these to the location.view element.
*/
function renderLocationView() {
  const location = this;

  // Hides the upload icon.
  location.view.querySelector('.btn-save').style.display = 'none';

  // Remove location.viewEntries.
  location.viewEntries.remove();

  // Enables the location view node and child elements.
  location.view.classList.remove('disabled');

  // Recreate location.viewEntries.
  location.viewEntries = location.view.appendChild(
    mapp.ui.locations.infoj(location),
  );
}
