export default entry => {

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview = entry.location.layer.mapview

  // Assign the mvt layer to be cloned from mapview layers.
  entry.Layer = entry.mapview.layers[entry.layer]

  // The entry must have a style object.
  entry.style = entry.style || {}

  // The entry style must have a default style.
  // The entry default style will be assigned to the mvt layer default style.
  entry.style.default = Object.assign(entry.Layer.style.default, entry.style.default || {})

  // Assign method to show the clone layer.
  entry.show = async () => {

    // The OL clone layer already exists.
    if (entry.L) {

      // Add clone layer to mapview Map.
      entry.mapview.Map.addLayer(entry.L)

      // Add clone layer to mvt layer clones.
      entry.Layer.clones.add(entry.L)
      return;
    }

    // Create query paramString from the entry object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

    // Query the featureLookup.
    entry.featureLookup = await mapp.utils.xhr(`${entry.host || entry.mapview.host}/api/query?${paramString}`)

    // Create clone VectorTile layer.
    entry.L = new ol.layer.VectorTile({
      source: entry.Layer.L.getSource(),
      renderBuffer: 200,
      zIndex: entry.zIndex,

      // Assign style from entry.style
      style: mapp.layer.Style(entry)
    });

    // Add the clone layer to the mvt layer clones.
    entry.Layer.clones.add(entry.L)

    // Add the clone layer to the mapview.Map.
    entry.mapview.Map.addLayer(entry.L)

    // Add a location.removeCallback to remove the clone from mapview.Map as well as the mvt layer clones.
    entry.location.removeCallbacks.push(() => {
      entry.mapview.Map.removeLayer(entry.L)
      entry.Layer.clones.delete(entry.L)
    })
  }

  // Assign method to hide the clone layer.
  entry.hide = async () => {

    entry.display = false

    // Remove the geometry layer from map.
    entry.mapview.Map.removeLayer(entry.L)

    // Remove the clone from the mvt layer clones.
    entry.Layer.clones.delete(entry.L)
  }

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'MVT Clone',
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => checked ? entry.show() : entry.hide()
  })

  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Create a style drawer for the location view entry.
  const drawer = mapp.ui.layers.panels.style(entry)

  // Create a node consistent of the chkbox and the style drawer.
  const node = mapp.utils.html.node`<div>${chkbox}${drawer}`

  // Disable chkbox if layer is out of zoom range
  function chkZoom() {
    if (!entry.Layer.tables) return;

    // Disable the checkbox input if necessary.
    if (entry.Layer.tableCurrent() === null) return node.querySelector('input').disabled = true
    node.querySelector('input').disabled = false
  }
  chkZoom()

  // Add zoom level check to mapview changeEnd event.
  entry.mapview.Map.getTargetElement().addEventListener('changeEnd', chkZoom)

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(()=>{
    mapview.Map.getTargetElement().removeEventListener('changeEnd', chkZoom)
  })

  // Return the node to the location view.
  return node
}