/**
## mapp.location.decorate()

@module /location/decorate

@param {Object} location
The location object to be decorated.
*/
export default location => {

  Object.assign(location, {
    flyTo,
    Layers: [],
    remove,
    removeCallbacks: [],
    removeEdits,
    restoreEdits,
    trash,
    update,
    syncFields,
    updateCallbacks: [],
  })

  return location;
}

function remove() {

  // Checks may be performed after async oprations
  // whether a location has already been removed.
  delete this.remove

  this.layer.mapview.hooks && mapp.hooks.filter('locations', this.hook)

  delete this.layer.mapview.locations[this.hook]

  this.view instanceof HTMLElement && this.view.remove()

  this.Layers?.forEach(
    L => this.layer.mapview.Map.removeLayer(L))

  this.layer.mapview.interaction.type !== 'highlight'
    && this.layer.mapview.interactions.highlight()

  // Reload the layer if possible.
  this.layer.reload && this.layer.reload()

  this.removeCallbacks?.forEach(
    fn => typeof fn === 'function' && fn(this))
}

/**
Update a location from host
@function update
@memberof module:location
*/

async function update() {

  // Map new values into newValues object.
  const newValues = Object.fromEntries(this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .map(entry => [entry.field, entry.newValue]))

  if (!Object.keys(newValues).length) return;

  await mapp.utils.xhr({
    method: 'POST',
    url:
      `${this.layer.mapview.host}/api/query?` +
      mapp.utils.paramString({
        template: 'location_update',
        locale: this.layer.mapview.locale.key,
        layer: this.layer.key,
        table: this.table,
        id: this.id,
      }),
    body: JSON.stringify(newValues),
  });

  // Update entry.values with newValues.
  // Return dependents from updated entries.
  const dependents = this.infoj
    .filter(entry => typeof entry.newValue !== 'undefined')
    .map(entry => {

      entry.value = entry.newValue;
      delete entry.newValue;

      return entry.dependents
    })
    .flat()
    .filter(dependents => dependents !== undefined)

  // sync dependent fields
  if (dependents.length) await this.syncFields([...new Set(dependents)])

  // Reload layer.
  this.layer.reload()

  this.updateCallbacks?.forEach(fn => typeof fn === 'function' && fn(this))
}

async function syncFields(fields) {

  const response = await mapp.utils.xhr(
    `${this.layer.mapview.host}/api/query?` +
    mapp.utils.paramString({
      template: 'location_get',
      locale: this.layer.mapview.locale.key,
      layer: this.layer.key,
      table: this.table,
      id: this.id,
      fields: fields.join(),
    }));

  // Return if response is falsy or error.
  if (!response || response instanceof Error) {
    console.warn('No data returned from location_get request.')
    return
  }
  // Check if the response is an array.
  else if (Array.isArray(response)) {
    console.warn(`Location response returned more than one record for Layer: ${this.layer.key}.`)
    console.log('Location Get Response:', response)
    return
  }

  this.infoj
    .filter(entry => typeof response[entry.field] !== 'undefined')
    .forEach(entry => {
      entry.value = response[entry.field];
    })
}

function flyTo(maxZoom) {
  const sourceVector = new ol.source.Vector();

  this.Layers.forEach((layer) => {
    const source = layer.getSource();
    typeof source.getFeatures === 'function' && sourceVector.addFeatures(source.getFeatures());
  });

  this.layer.mapview.fitView(sourceVector.getExtent(), {
    maxZoom
  });
}

async function trash() {

  if (!confirm(mapp.dictionary.confirm_delete)) return;

  await mapp.utils.xhr(`${this.layer.mapview.host}/api/query?` +
    mapp.utils.paramString({
      template: 'location_delete',
      locale: this.layer.mapview.locale.key,
      layer: this.layer.key,
      table: this.table,
      id: this.id
    }))

  this.remove()
}

function removeEdits() {

  // Iterate through the location.infoj entries.
  this.infoj.forEach(entry => {

    if (!entry.edit) return;

    // Remove newValue
    // Unsaved edits will be lost.
    delete entry.newValue

    // Change edit key to _edit
    entry._edit = entry.edit
    delete entry.edit
  })
}

function restoreEdits() {

  // Restore edit in infoj entries
  this.infoj.forEach(entry => {

    if (!entry._edit) return;

    entry.edit = entry._edit
    delete entry._edit
  })
}