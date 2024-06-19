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

  entry.zIndex ??= entry.Layer.zIndex

  // The entry must have a style object.
  entry.style ??= entry.Layer.style

  if (entry.style.default) {

    // Assign the location style to the default style.
    entry.style.default = {...entry.location?.style, ...entry.style.default}
  }

  // Add entry.key to the entry object.
  entry.key ??= entry.Layer.key;
  
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

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(() => {

    entry.mapview.Map.removeLayer(entry.L)

    entry.Layer.clones.delete(entry.L)

    entry.mapview.Map.getTargetElement().removeEventListener('changeEnd', chkZoom)
  })

  if (entry.style.themes) {

    // Assign the first theme from themes if undefined.
    entry.style.theme ??= entry.style.themes[Object.keys(entry.style.themes)[0]]
  }

  // Create a style panel as entry.style.panel and append to entry.node.
  entry.style.panel = mapp.ui.layers.panels.style(entry)

  if (entry.style.panel) {
    entry.style.panel.style.display = 'none'
    entry.view = entry.panel
  }

  // Assign method to show the clone layer.
  entry.show = async () => {

    entry.display = true;

    // Create query paramString from the entry object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

    // Query the featureLookup.
    entry.featureLookup = await mapp.utils.xhr(`${entry.host || entry.mapview?.host || mapp.host}/api/query?${paramString}`)

    // The query does not return a response.
    if (entry.featureLookup === null) {

      // Disable the chkbox input.
      entry.panel.querySelector('input').disabled = true

      if (entry.style.panel) {
        entry.style.panel.style.display = 'none'
      }

      return;
    }

    if (!Array.isArray(entry.featureLookup)) {

      entry.featureLookup = [entry.featureLookup]
    }

    try {
      entry.mapview.Map.addLayer(entry.L)

    } catch {
      // Will catch assertation error when layer is already added.
    }

    if (entry.style.panel) {
      entry.style.panel.style.display = 'block'
    }
  };

  // Assign method to hide the clone layer.
  entry.hide = async () => {

    entry.display = false

    // Remove the geometry layer from map.
    entry.mapview.Map.removeLayer(entry.L)

    // Hide the style drawer.
    if (entry.style.panel) {
      entry.style.panel.style.display = 'none'
    }
  }

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'MVT Clone',
    data_id: `${entry.key}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? entry.show() : entry.hide()
  })

  // Create a node consistent of the chkbox and the style drawer.
  entry.panel = mapp.utils.html.node`<div>
    ${chkbox}
    ${entry.style.panel}`

  // Show geometry if entry is set to display.
  entry.display && entry.show()

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
      if (entry.style.panel) {
        entry.style.panel.style.display = 'none'
      }

      return;
    }

    // Enable checkbox.
    entry.panel.querySelector('input').disabled = false

    // Display style drawer if present.
    if (entry.style.panel) {
      entry.style.panel.style.display = 'block'
    }
  }

  chkZoom()

  // Add zoom level check to mapview changeEnd event.
  entry.mapview.Map.getTargetElement().addEventListener('changeEnd', chkZoom)

  // Return the node to the location view.
  return entry.panel
}