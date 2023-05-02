export default entry => {

  // Assign mapview to entry to provide shortened lookup.
  entry.mapview = entry.location.layer.mapview

  // Assign the mvt layer to be cloned from mapview layers.
  entry.Layer = entry.mapview.layers[entry.layer]

  if (!entry.Layer) {
    console.warn('mvt_clone Layer not found in mapview.layers object.')
    return;
  }

  // Create clone VectorTile layer.
  entry.L = new ol.layer.VectorTile({
    source: entry.Layer.L.getSource(),
    renderBuffer: 200,
    zIndex: entry.zIndex,

    // Assign style from entry.style
    style: entry.Layer.style
  });

  console.log(entry.Layer); 
  // Add the clone layer to the mvt layer clones.
  entry.Layer.clones.add(entry.L)

  // The entry must have a style object.
  entry.style = entry.Layer.style || {}

  // The entry style must have a default style.
  // The entry default style will be assigned to the mvt layer default style.
  entry.style.default = Object.assign({}, entry.location?.style || {}, entry.style.default || {})

  if (entry.style.themes) {

    // Assign the first theme in themes object as theme.
    entry.style.theme = entry.style.themes[Object.keys(entry.style.themes)[0]]
  }

  // Assign method to show the clone layer.
  entry.show = async () => {

    console.log(entry);

    entry.display = true;

    // The OL clone layer already exists.
    if (entry.L && entry.featureLookup) {

      if (entry.view) entry.view.style.display = 'block'

      try {
        entry.mapview.Map.addLayer(entry.L)
      } catch {
        // Will catch assertation error when layer is already added.
      }

      return;
    }

    // Create the style panel.
    entry.view = mapp.ui.layers.panels.style(entry)
    entry.view && entry.node.append(entry.view)

    // Create query paramString from the entry object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))
    console.log(paramString);

    // Query the featureLookup.
    entry.featureLookup = await mapp.utils.xhr(`${entry.host || entry.mapview.host}/api/query?${paramString}`)

    console.log(entry.featureLookup); 

    // if the query returns nothing, we should remove the layer from the map and disabled the checkbox.
    if (entry.featureLookup===null) {
        // Remove the geometry layer from map.
    entry.mapview.Map.removeLayer(entry.L)
    // Disable checkbox.
    node.querySelector('input').disabled = true
     // Hide style drawer if present.
     if (entry.view) entry.view.style.display = 'none'

     // Remove clone layer if present in set but should not be displayed.
     !entry.display && entry.mapview.Map.removeLayer(entry.L)
    // return
    return;
    } else {

    // Add the clone layer to the mapview.Map.
    entry.mapview.Map.addLayer(entry.L)

    // Add a location.removeCallback to remove the clone from mapview.Map as well as the mvt layer clones.
    entry.location.removeCallbacks.push(() => {
      entry.mapview.Map.removeLayer(entry.L)
      entry.Layer.clones.delete(entry.L)
    })
  }
};

  // Assign method to hide the clone layer.
  entry.hide = async () => {

    entry.display = false

    // Hide the style drawer.
    if (entry.view) entry.view.style.display = 'none'

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

      // If the featureLookup is null, ignore zoom level check.
      if (entry.featureLookup===null) return;
      
  // Show geometry if entry is set to display.
  entry.display && entry.show()

  // Create a node consistent of the chkbox and the style drawer.
  const node = mapp.utils.html.node`<div>${chkbox}`

  // Disable chkbox if layer is out of zoom range
  function chkZoom() {

    // The mvt layer can be displayed at all zoom levels.
    if (!entry.Layer.tables) return;

    // The clone layer cannot be displayed.
    if (entry.Layer.tableCurrent() === null) {

      // Disable checkbox.
      node.querySelector('input').disabled = true

      // Hide style drawer if present.
      if (entry.view) entry.view.style.display = 'none'

      // Remove clone layer if present in set but should not be displayed.
      !entry.display && entry.mapview.Map.removeLayer(entry.L)

      return;
    }

    // Enable checkbox.
    node.querySelector('input').disabled = false

    // Display style drawer if present.
    if (entry.view) entry.view.style.display = 'block'
    
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
  entry.location.removeCallbacks.push(()=>{

    // Remove layer from map when location is removed.
    entry.mapview.Map.removeLayer(entry.L)

    entry.mapview.Map.getTargetElement().removeEventListener('changeEnd', chkZoom)
  })

  // Return the node to the location view.
  return node
}