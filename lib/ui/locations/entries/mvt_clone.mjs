export default entry => {

  // The entry has already been processed.
  // There is an entry.panel to be rendered into the entry.node.
  if (entry.panel) return entry.panel;

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview ??= entry.location.layer.mapview

  if (!entry.mapview) {

    console.warn(`mvt_clone entry requires a mapview.`)
    return;
  }

  // Assign the mvt layer to be cloned from mapview layers.
  entry.Layer = entry.mapview.layers[entry.layer]

  if (!entry.Layer) {
    console.warn('mvt_clone Layer not found in mapview.layers object.')
    return;
  }

  // The entry must have a style object.
  entry.style ??= entry.Layer.style

  if (entry.style.default) {

    // Assign the location style to the default style.
    entry.style.default = {...entry.location?.style, ...entry.style.default}
  }

  // Update entry.style config.
  mapp.layer.styleParser(entry)

  // Create clone VectorTile layer.
  entry.L = new ol.layer.VectorTile({
    source: entry.Layer.L.getSource(),
    renderBuffer: 200,
    zIndex: entry.zIndex,

    // Assign style from entry.style
    style: mapp.layer.featureStyle(entry)
  });

  // Add the clone layer to the mvt layer clones.
  entry.Layer.clones.add(entry.L)

  if (entry.style.themes) {

    // Assign the first theme from themes if undefined.
    entry.style.theme ||= entry.style.themes[Object.keys(entry.style.themes)[0]]
  }

  // Assign method to show the clone layer.
  entry.show = async () => {

    entry.display = true;

    // The OL clone layer already exists.
    if (entry.L && entry.featureLookup) {

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
    entry.featureLookup = await mapp.utils.xhr(`${entry.host || entry.mapview?.host || mapp.host}/api/query?${paramString}`)

    // The query does not return a response.
    if (entry.featureLookup === null) {

      // Disable the chkbox input.
      entry.panel.querySelector('input').disabled = true

      // The entry.style.panel will not be created.
      return;
    }

    // Create a style panel as entry.style.panel and append to entry.node.
    entry.style.panel = mapp.ui.layers.panels.style(entry)
    
    if (entry.style.panel) {
      entry.panel.append(entry.style.panel)
      entry.view = entry.panel
    }
    
    // Add the clone layer to the mapview.Map.
    entry.mapview.Map.addLayer(entry.L)

    // Add a location.removeCallback to remove the clone from mapview.Map as well as the mvt layer clones.
    entry.location.removeCallbacks.push(() => {
      entry.mapview.Map.removeLayer(entry.L)
      entry.Layer.clones.delete(entry.L)
    })

  };

  // Assign method to hide the clone layer.
  entry.hide = async () => {

    entry.display = false

    // Hide the style drawer.
    if (entry.style.panel) entry.style.panel.style.display = 'none'

    // Remove the geometry layer from map.
    entry.mapview.Map.removeLayer(entry.L)

    // Remove the clone from the mvt layer clones.
    entry.Layer.clones.delete(entry.L)
  }

  entry.reload = () => entry.L?.changed()

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'MVT Clone',
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? entry.show() : entry.hide()
  })

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Create a node consistent of the chkbox and the style drawer.
  entry.panel = mapp.utils.html.node`<div>${chkbox}`

  // Disable chkbox if layer is out of zoom range
  function chkZoom() {

    // The mvt layer can be displayed at all zoom levels.
    if (!entry.Layer.tables) return;

    // if the featureLookup is null, the layer cannot be displayed.
    // This is for when you zoom out beyond the zoom range of the layer, and then zoom back in.
    if (entry.featureLookup === null) return; 

    // The clone layer cannot be displayed.
    if (entry.Layer.tableCurrent() === null) {

      // Disable checkbox.
      entry.panel.querySelector('input').disabled = true

      // Hide style drawer if present.
      if (entry.style.panel) entry.style.panel.style.display = 'none'

      // Remove clone layer if present in set but should not be displayed.
      !entry.display && entry.mapview.Map.removeLayer(entry.L)

      return;
    }

    // Enable checkbox.
    entry.panel.querySelector('input').disabled = false

    // Display style drawer if present.
    if (entry.style.panel) entry.style.panel.style.display = 'block'

    // Try to add entry.L to mapview.Map
    try {
      entry.display && entry.mapview.Map.addLayer(entry.L)
    } catch {
      // Will catch assertation error when layer is already added.
    }

  }

  chkZoom()

  // Add zoom level check to mapview changeEnd event.
  entry.mapview.Map.getTargetElement().addEventListener('changeEnd', chkZoom)

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(() => {

    // Remove layer from map when location is removed.
    entry.mapview.Map.removeLayer(entry.L)

    entry.mapview.Map.getTargetElement().removeEventListener('changeEnd', chkZoom)
  })

  // Return the node to the location view.
  return entry.panel
}