/**
## /location/get

The module exports the location get and getInfoj methods to request location data from the XYZ host.

@requires /location/decorate
@requires /hooks

@module /location/get
*/

/**
@function get

@description
The method will shortcircuit if a default getLocation method has been assigned to the interaction.

The get method assigns a unique location.hook composed from the location.layer.key and the location.id.

The layer.key being unique to the locale, and the id being unique to the layer makes the location.hook unique to the mapview.

@param {object} location
@param {object} list
@property {layer} location.layer The layer to which the location belongs.
@property {string} location.id The ID must be unique for the layer dataset.
@property {mapview} layer.mapview
@property {boolean} mapview.hooks Hooks are enabled for the location.layer.mapview.
@returns {Promise<object>} Decorated location
*/
export async function get(location, list = location.layer.mapview.locations) {

  // A getLocation function has been assigned to the current mapview.interaction.
  if (location.layer.mapview.interaction?.getLocation instanceof Function) {

    location.layer.mapview.interaction?.getLocation(location)
    return;
  }

  if (!location.layer || !location.id) return;

  // Create location hook.
  location.hook ??= `${location.layer.key}!${location.id}`;

  // Remove location if already in list.
  if (list[location.hook]) {
    list[location.hook].remove()
    delete list[location.hook]

    // Remove hook to mapview.interaction.locations set.
    location.layer.mapview.interaction?.locations?.delete(location.hook)
    return;
  }

  // Assign locale key to location
  location.locale ??= location.layer.mapview.locale.key

  await getInfoj(location)

  mapp.location.decorate(location)

  // Assign location to mapview.
  list[location.hook] = location

  // Hooks are enabled for the mapview
  if (location.layer.mapview.hooks) {
    
    mapp.hooks.push('locations', location.hook)
  }

  return location
}

export async function getInfoj(location) {

  if (!location.layer) {
    console.warn('No layer provided for getLocationInfoj()')
    return;
  }

  // Location layer is provided as key.
  if (typeof location.layer === 'string') {

    location.layer = await mapp.utils.xhr(`${mapp.host}/api/workspace/layer?locale=${location.locale}&layer=${location.layer}`)
  }

  location.getTemplate ??= 'location_get'

  // Get table from layer if not provided.
  location.table ??= location.layer.table
    || location.layer.tables
    && Object.values(location.layer.tables).find(table => !!table)

  // Request the location fields from layer json & id.
  const response = await mapp.utils.xhr(`${mapp.host}/api/query?` + mapp.utils.paramString({
    template: location.getTemplate,
    locale: location.locale,
    layer: location.layer.key,
    table: location.table,
    id: location.id,
  }));

  // Check if the response is empty.
  if (!response || response instanceof Error) {
    console.warn('No data returned from location_get request using ID:', location.id)
    return
  }
  // Check if the response is an array.
  else if (Array.isArray(response)) {
    console.warn(`Location response returned more than one record for Layer: ${location.layer.key}.`)
    console.log('Location Get Response:', response)
    return
  }

  // Assign qID as default field if layer has no infoj.
  location.layer.infoj ??= [{ field: location.layer.qID }]

  // Parse and clone the infoj and response data.
  location.infoj = location.layer.infoj?.map(_entry => ({
    ...structuredClone(_entry),
    title: _entry.title || response[_entry.field + '_label'],
    value: response[_entry.field],
    location
  }))

  return location.infoj
}
