export default async function (location, list = location.layer.mapview.locations) {

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

  // Get dbs table from layer.
  location.table = location.table
    || location.layer.table
    || Object.values(location.layer.tables).find(table => !!table)

  // Get data from location api.
  const response = await mapp.utils.xhr(
    `${location.layer.mapview.host}/api/location/get?` +
    mapp.utils.paramString({
      locale: location.layer.mapview.locale.key,
      layer: location.layer.key,
      table: location.table,
      id: location.id,
    })
  );

  if (!response) {

    console.log('No data returned from location get request')
    mapp.hooks.filter('locations', location.hook)
    return;
  }

  const infoj = location.layer.infoj.map(_entry => {

    const entry = mapp.utils.clone(_entry)

    Object.assign(entry, {
      title: response[entry.field + '_label'] || entry.title,
      value: response[entry.field],
      location
    })

    return entry
  })

  mapp.location.decorate(Object.assign(location, { infoj }))

  // Assign location to mapview.
  list[location.hook] = location

  // Remove hook to mapview.interaction.locations set.
  location.layer.mapview.interaction?.locations?.delete(location.hook)

  // Push location hook to URL if hooks are enabled for the mapview.
  location.layer.mapview.hooks && mapp.hooks.push('locations', location.hook)

  return location
}