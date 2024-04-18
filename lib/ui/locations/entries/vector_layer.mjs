export default entry => {

  // The entry has already been processed.
  // There is an entry.panel to be rendered into the entry.node.
  if (entry.panel) return entry.panel;

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview ??= entry.location.layer.mapview

  if (!entry.mapview) {

    console.warn(`vector_layer entry requires a mapview.`)
    return;
  }

  entry.style ??= {}

  if (entry.style.default) {

    // Assign the location style to the default style.
    entry.style.default = {...entry.location?.style, ...entry.style.default}
  }

    // Add entry.key to the entry object.
    entry.key ??= entry.Layer.key;
    
  // Update entry.style config.
  mapp.layer.styleParser(entry)

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'MVT Clone',
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? show(entry) : hide(entry)
  })

  // Show geometry if entry is set to display.
  entry.display && show(entry)

  // Create a node consistent of the chkbox and the style drawer.
  entry.panel = mapp.utils.html.node`<div>${chkbox}`

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(() => {

    // Remove layer from map when location is removed.
    entry.mapview.Map.removeLayer(entry.L)
  })

  // Return the node to the location view.
  return entry.panel
}

async function show(entry) {

  entry.display = true;

  // The OL clone layer already exists.
  if (entry.L) {

    if (entry.style.panel) entry.style.panel.style.display = 'block'

    try {
      entry.mapview.Map.addLayer(entry.L)

    } catch {
      // Will catch assertation error when layer is already added.
    }

    return;
  }

  // Create query paramString from the entry object.
  const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

  // Query the featureLookup.
  entry.features = await mapp.utils.xhr(`${entry.host || entry.mapview?.host || mapp.host}/api/query?${paramString}`)

  mapp.layer.formats[entry.format](entry)

  // Create a style panel as entry.style.panel and append to entry.node.
  entry.style.panel = mapp.ui.layers.panels.style(entry)
  entry.style.panel && entry.panel.append(entry.style.panel)

  // Add the clone layer to the mapview.Map.
  entry.mapview.Map.addLayer(entry.L)

  // Add a location.removeCallback to remove the clone from mapview.Map as well as the mvt layer clones.
  entry.location.removeCallbacks.push(() => {
    entry.mapview.Map.removeLayer(entry.L)
  })

}

function hide(entry) {

  entry.display = false

  // Hide the style drawer.
  if (entry.style.panel) entry.style.panel.style.display = 'none'

  // Remove the geometry layer from map.
  entry.mapview.Map.removeLayer(entry.L)
}