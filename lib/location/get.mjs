export async function get (location, list = location.layer.mapview.locations) {

  // A getLocation function has been set for the current mapview.interaction.
  if (location.layer.mapview.interaction?.getLocation instanceof Function) {

    location.layer.mapview.interaction?.getLocation(location)
    return;
  }

  if (!location.layer || !location.id) return;

  // Create location hook.
  location.hook = `${location.layer.key}!${location.id}`;

  // Return if hook exists in mapview.interaction.locations set.
  if (location.layer.mapview.interaction?.locations?.has(location.hook)) return;

  // Add hook to mapview.interaction.locations set.
  location.layer.mapview.interaction?.locations?.add(location.hook)

  // Remove location if already in list.
  if (list[location.hook]) {
    list[location.hook].remove()
    delete list[location.hook]

    // Remove hook to mapview.interaction.locations set.
    location.layer.mapview.interaction?.locations?.delete(location.hook)
    return;
  }

  location.locale = location.layer.mapview.locale.key

  location.infoj = await getInfoj(location)
 
  mapp.location.decorate(location)

  // Assign location to mapview.
  list[location.hook] = location

  // Remove hook to mapview.interaction.locations set.
  location.layer.mapview.interaction?.locations?.delete(location.hook)

  // A location must have a record from a listview.
  location.record

    // Hooks must be enabled on the mapview.
    && location.layer.mapview.hooks

    // Push location hook to URL params.
    && mapp.hooks.push('locations', location.hook)

  return location
}

export async function getInfoj (location) {

  if (!location.layer) {
    console.warn('No layer provided for getLocationInfoj()')
    return;
  }

  // Location layer is provided as key.
  if (typeof location.layer === 'string') {

    location.layer = await mapp.utils.xhr(`${mapp.host}/api/workspace/layer?locale=${location.locale}&layer=${location.layer}`)
  }

  // Get table from layer if not provided.
  location.table ??= location.layer.table
    || Object.values(location.layer.tables).find(table => !!table)

  // Request the location fields from layer json & id.
  const response = await mapp.utils.xhr(`${mapp.host}/api/query?` + mapp.utils.paramString({
    template: 'location_get',
    locale: location.locale,
    layer: location.layer.key,
    table: location.table,
    id: location.id,
  }));

  if (!response) {

    console.warn('No data returned from location_get request.')
    return;
  }

  // Assign qID as default field if layer has no infoj.
  location.layer.infoj ??= [{ field: location.layer.qID }]

  // Parse and clone the infoj and response data.
  return location.layer.infoj?.map(_entry => ({
    ...structuredClone(_entry),
    title: _entry.title || response[_entry.field + '_label'],
    value: response[_entry.field],
    location
  }))
}
