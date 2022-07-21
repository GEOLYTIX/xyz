export default entry => {

  // Create checkbox to control geometry display.
  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'MVT Clone',
    data_id: `${entry.field}-chkbox`,
    checked: !!entry.display,
    onchange: (checked) => {
      
      // Show geometry of checked.
      if (checked) {
        show()

      } else {
        
        // Remove the geometry layer from map.
        entry.display = false
        entry.L && entry.location.layer.mapview.Map.removeLayer(entry.L)
        entry.legend?.remove()
      }
    }
  })

  // Show geometry if entry is set to display.
  entry.display && show()

  // Return checkbox only if list is empty.
  return mapp.utils.html.node`<div>${chkbox}`

  async function show() {

    const mapview = entry.location.layer.mapview
   
    const params = mapp.utils.queryParams(entry)

    const paramString = mapp.utils.paramString(params)

    const response = await mapp.utils
      .xhr(`${entry.host || entry.location.layer.mapview.host}/api/query?${paramString}`)

    if (!entry.location.remove) return;
  
    const Layer = mapview.layers[entry.layer]
  
    const layer = {
      style: Object.assign({}, Layer.style),
      featureLookup: response
    }

    if (entry.theme) {

      layer.style.theme = entry.theme

      entry.legend = entry.node.appendChild(mapp.utils.html.node`
        <div class="legend">
          ${entry.theme.title || ''}
          ${mapp.ui.layers.styles[entry.theme.type](layer)}`)

    }

    entry.L = new ol.layer.VectorTile({
      source: Layer.L.getSource(),
      renderBuffer: 200,
      style: mapp.layer.Style(layer)
    });
  
    entry.location.Layers.push(entry.L)
  
    mapview.Map.addLayer(entry.L)
  }

}