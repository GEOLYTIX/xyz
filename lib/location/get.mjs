/**
## /location/get

The module exports the location get and getInfoj methods to request location data from the XYZ host.

@requires /location/decorate
@requires /hooks
@requires /utils/xhr

@module /location/get
*/

/**
@function get

@description
The method will shortcircuit if a default getLocation method has been assigned to the [highlight] interaction.

The get method assigns a unique location.hook composed from the location.layer.key and the location.id.

The layer.key being unique to the locale, and the id being unique to the layer makes the location.hook unique to the mapview.

A location will be removed from the list object param if the location already exists in the list. Otherwise the location will be assigned as a property to the list object.

The getInfoj() method is awaited before the location is decorated.

@param {object} location
@param {object} list Object in which locations are stored as properties.
@property {layer} location.layer The layer to which the location belongs.
@property {string} location.id The ID must be unique for the layer dataset.
@property {Array} [layer.infoj] The infoj array from the layer, this is required to decorate the location.
@property {mapview} layer.mapview 
@property {object} mapview.interaction The current [highlight] interaction.
@property {boolean} mapview.hooks Hooks are enabled for the location.layer.mapview.
@returns {Promise<object>} Decorated location
*/
const locations = new Set()
export async function get(location, list = location.layer.mapview.locations) {

  const mapview = location.layer.mapview;

  // A getLocation function has been assigned to the current mapview.interaction.
  if (mapview.interaction?.getLocation instanceof Function) {

    mapview.interaction?.getLocation(location)
    return;
  }

  // Location has no layer or id, return.
  if (!location.layer || !location.id) return;

  // Location has no infoj to decorate, return.
  if (!location.layer.infoj) return;

  // Build location hook from layer key and location id.
  location.hook ??= `${location.layer.key}!${location.id}`;

  if (list[location.hook]) {

    // Remove location if already in list.
    list[location.hook].remove()
    delete list[location.hook]
    return;
  }

  // Prevent location from being requested again while not yet decorated.
  if (locations.has(location.hook)) return;
  locations.add(location.hook)

  // Assign locale key to location
  location.locale ??= mapview.locale.key

  await getInfoj(location)

  mapp.location.decorate(location)

  // Location will be removed if requested again as decorated.
  locations.delete(location.hook)

  // Assign location to mapview.
  list[location.hook] = location

  // Hooks are enabled for the mapview
  if (mapview.hooks) {

    mapp.hooks.push('locations', location.hook)
  }

  return location
}

/**
@function getInfoj

@description
The method sends a parameterised query to the location.getTemplate query template.

The response is expected to be an object, not an array.

The response properties are mapped into clones of the layer.infoj which will be assigned to the location.

@param {object} location
@property {layer} location.layer The layer to which the location belongs.
@property {layer} [location.getTemplate='location_get'] The query template for the location data.

@returns {Promise<object>} The populated location.infoj entries array.
*/
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
  const response = await getFeatureResponse(location);

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

async function getFeatureResponse(location) {
  // Check if features are already available locally
  if (location.layer.featureLocation) {
    const feature = location.layer.features
      .find(feature => feature.properties.id === location.id);

    return feature ? {
      geometry: feature.geometry,
      ...feature.properties
    } : null;
  }

  // If not available locally, fetch from API
  const queryParams = {
    template: location.getTemplate,
    locale: location.locale,
    layer: location.layer.Key || location.layer.key,
    table: location.table,
    id: location.id,
  };

  const apiUrl = `${mapp.host}/api/query?${mapp.utils.paramString(queryParams)}`;
  return await mapp.utils.xhr(apiUrl);
}
