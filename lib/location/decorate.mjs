/**
### /location/decorate

@requires /utils/xhr

Dictionary entries:
- confirm_delete

@requires /dictionary

@module /location/decorate
*/

/**
@global
@typedef {Object} location
A decorated mapp location.

@property {layer} layer The layer from which the location data was queried.
@property {string} [getTemplate="location_get"] Query from which to retrieve location data.
@property {string} [table] Layer table from which to get the location data.
@property {Array} Layers Array of Openlayer Layers (with Source) to store geometries associated with the location.
@property {Array} infoj Array of infoj-entry objects with their values populated by the location get() method.
@property {function} remove {@link module:/location/decorate~remove}
@property {function} flyTo {@link module:/location/decorate~flyTo}
@property {HTMLElement} view The location view displayed in the location listview in the default Mapp application view.
*/

/**
@function decorate

@description
The location decorator method creates mapp-location typedef object from a JSON location.

@param {object} location JSON location.

@returns {location} Decorated Mapp Location.
*/
export default function decorate(location) {
  Object.assign(location, {
    getExtent,
    flyTo,
    Layers: [],
    remove,
    removeCallbacks: [],
    removeEdits,
    restoreEdits,
    syncFields,
    trash,
    update,
    updateCallbacks: [],
  });

  return location;
}

/**
@function remove

@description
The remove method is bound to a location in the location.decorate method.

this being the location, the method will first remove itself to prevent the method being called twice.

The remove method will free the location record by deleting the location.hook.

A location.view HTMLElement will be removed from the DOM.

Any Openlayers layer in the location.Layers[] array will be removed from the mapview.

The highlight interaction will be assigned to the location mapview.

The location layer will be reload [and restyled in the process].

Any methods in the location.removeCallbacks[] array will be executed.
*/
function remove() {
  // Checks may be performed after async oprations
  // whether a location has already been removed.
  delete this.remove;

  this.layer.mapview.hooks && mapp.hooks.filter('locations', this.hook);

  delete this.layer.mapview.locations[this.hook];

  this.view instanceof HTMLElement && this.view.remove();

  this.Layers?.forEach((entry) => entry.hide?.());

  // Restore highlight interaction.
  // A different interaction may have been set from a location method.
  this.layer.mapview.interaction?.type !== 'highlight' &&
    this.layer.mapview.interactions.highlight();

  // Reload the layer if possible.
  this.layer?.reload?.();

  this.removeCallbacks?.forEach((fn) => typeof fn === 'function' && fn(this));
}

/**
@function update

@description
The update method is bound to the location (this) in the decorator method.

The update method will abort if some of the location.infoj entries is invalid.

JSON newValues are created for any json or jsonb type entries in the location.infoj array.

An xhr POST request with all newValues is passed to location_update query template.

infoj entry values are set to the newValues after a successful update.

Dependent fields for updated entries is an array of fields that is passed to the syncFields method, to retrieve the updated values from the location. 
These dependents fields are reloaded with the updated values from the location.

Dependent layers is an array of layer keys that will be reloaded after the update.
*/
async function update() {
  if (this.infoj.some((entry) => entry.invalid)) {
    alert(`Unable to update location with invalid entry value.`);
    return new Error('Unable to update.');
  }

  // Create newValue for jsonb entries.
  this.infoj
    .filter((entry) => entry.jsonb_key)
    .filter((entry) => entry.jsonb_field)
    .filter((entry) => typeof entry.newValue !== 'undefined')
    .forEach((entry) => {
      entry.newValue = {
        jsonb: {
          [entry.jsonb_field]: {
            [entry.jsonb_key]: entry.newValue,
          },
        },
      };
    });

  // Create newValue on json_field entries.
  this.infoj
    .filter((entry) => entry.json_field)
    .filter((entry) => entry.json_key)
    .filter((entry) => typeof entry.newValue !== 'undefined')
    .forEach((entry) => {
      const fieldEntry = this.infoj.find(
        (_entry) => _entry.field === entry.json_field,
      );

      fieldEntry.newValue ??= fieldEntry.value || {};

      fieldEntry.newValue[entry.json_key] = entry.newValue;

      delete entry.newValue;
    });

  // Map newValues from infoj entry objects.
  const newValues = Object.fromEntries(
    this.infoj
      .filter((entry) => typeof entry.newValue !== 'undefined')
      .map((entry) => [entry.field, entry.newValue]),
  );

  // Shortcircuit if no update is required.
  if (!Object.keys(newValues).length) return;

  const location_update = await mapp.utils.xhr({
    body: JSON.stringify(newValues),
    method: 'POST',
    url:
      `${this.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        id: this.id,
        layer: this.layer.key,
        locale: this.layer.mapview.locale.key,
        table: this.table,
        template: 'location_update',
      }),
  });

  if (location_update instanceof Error) {
    alert(`Location update has failed.`);
    this.view?.classList.remove('disabled');
    return;
  }

  // Find newValue entries for update.
  const dependents = this.infoj
    .filter((entry) => typeof entry.newValue !== 'undefined')
    .map((entry) => {
      // Update entry.values with newValues.
      entry.value = entry.newValue;

      // Remove newValue
      delete entry.newValue;

      // Iterate through the dependents_layers array
      if (Array.isArray(entry.dependents_layers)) {
        entry.dependents_layers.forEach((layer) => {
          // Find the layer in mapview.
          const mapview_layer = entry.location.layer.mapview.layers[layer];

          // If the layer exists, reload it.
          if (mapview_layer) mapview_layer.reload();
        });
      }

      return entry.dependents;
    })
    // Flatten dependents array and filter out undefined values.
    .flat()
    .filter((dependents) => dependents !== undefined);

  // sync dependent fields
  if (dependents.length) await this.syncFields([...new Set(dependents)]);

  // Reload layer.
  this.layer.reload();

  // Execute update callbacks.
  this.updateCallbacks?.forEach((fn) => typeof fn === 'function' && fn(this));
}

/**
@function syncFields
@async

@description
The syncFields method sends a parameterised query to the location_get query template. The fields parameter will be populated from the fields params argument.

Values of the location [this] infoj entry matching the fields will be updated with values from the query response.

@param {array} fields
*/
async function syncFields(fields) {
  // fields must be an array
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  const response = await mapp.utils.xhr(
    `${this.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        fields: fields.join(),
        id: this.id,
        layer: this.layer.key,
        locale: this.layer.mapview.locale.key,
        table: this.table,
        template: 'location_get',
      }),
  );

  // Return if response is falsy or error.
  if (!response || response instanceof Error) {
    console.warn(
      'No data returned from location_get request using ID:',
      this.id,
    );
    return;
  } else if (Array.isArray(response)) {
    console.warn(
      `Location response returned more than one record for Layer: ${this.layer.key}.`,
    );
    console.log('Location Get Response:', response);
    return;
  }

  this.infoj
    .filter((entry) => typeof response[entry.field] !== 'undefined')
    .forEach((entry) => {
      entry.value = response[entry.field];
    });
}

/**
@function flyTo
@async

@description
Centers the mapview arround the outermost extent of a location, this will also adhere to the maximum
zoom level specified on the layer. 

The extent from the layers that have been added to the Extents property are used in {@link module:/utils/createExtent},
The greatest extent of these is used in {@link module:/mapview/fitView}. 

@param {integer} [maxZoom] The maximum zoom level of the layer.
*/
async function flyTo(maxZoom) {
  const location = this;

  const flyToExtent = await location.getExtent();

  flyToExtent &&
    location.layer.mapview.fitView(flyToExtent, {
      maxZoom,
    });
}

async function trash() {
  const confirm = await mapp.ui.elements.confirm({
    text: mapp.dictionary.confirm_delete,
  });

  if (!confirm) return;

  await mapp.utils.xhr(
    `${this.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        id: this.id,
        layer: this.layer.key,
        locale: this.layer.mapview.locale.key,
        table: this.table,
        template: 'location_delete',
      }),
  );

  this.remove();
}

function removeEdits() {
  // Iterate through the location.infoj entries.
  this.infoj.forEach((entry) => {
    if (!entry.edit) return;

    // Remove newValue
    // Unsaved edits will be lost.
    delete entry.newValue;

    // Change edit key to _edit
    entry._edit = entry.edit;
    delete entry.edit;
  });
}

function restoreEdits() {
  // Restore edit in infoj entries
  this.infoj.forEach((entry) => {
    if (!entry._edit) return;

    entry.edit = entry._edit;
    delete entry._edit;
  });
}

/**
@function getExtent
@async

@description
The method iterates over the location Layers and calculates the overall extent returned from the individual extent methods.

@returns {Promise<Array>} The overall extent returned from the Extents methods.
*/
async function getExtent() {
  const location = this;
  const overall_extent = ol.extent.createEmpty();

  for (const entry of location.Layers) {
    if (!entry.display) continue;

    //await extent function if it is one
    const extent = await entry.getExtent();

    //extend the extent to create the greates one
    Array.isArray(extent) && ol.extent.extend(overall_extent, extent);
  }

  return !overall_extent.every((val) => isFinite(val)) ? null : overall_extent;
}
