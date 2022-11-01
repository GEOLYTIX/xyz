export default entry => {

  const mapview = entry.location.layer.mapview

  entry.Layer = mapview.layers[entry.layer]

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
        mapview.Map.removeLayer(entry.L)
        entry.Layer.clones.delete(entry.L)
        entry.legend?.remove()
      }
    }
  })

  // Show geometry if entry is set to display.
  entry.display && show()

  const node = mapp.utils.html.node`<div>${chkbox}`

  // Disable chkbox if layer is out of zoom range
  function chkZoom() {
    if (!entry.Layer.tables) return;
    if (entry.Layer.tableCurrent() === null) return node.querySelector('input').disabled = true
    node.querySelector('input').disabled = false
  }
  chkZoom()

  // Add zoom level check to mapview changeEnd event.
  mapview.Map.getTargetElement().addEventListener('changeEnd', chkZoom)

  // Remove zoom level check from mapview changeEnd event.
  entry.location.removeCallbacks.push(()=>{
    mapview.Map.getTargetElement().removeEventListener('changeEnd', chkZoom)
  })

  // Return checkbox only if list is empty.
  return node

  async function show() {

    if (entry.L) {
      mapview.Map.addLayer(entry.L)
      entry.Layer.clones.add(entry.L)
      return;
    }
  
    const params = mapp.utils.queryParams(entry)

    const paramString = mapp.utils.paramString(params)

    const response = await mapp.utils
      .xhr(`${entry.host || entry.location.layer.mapview.host}/api/query?${paramString}`)

    if (!entry.location.remove) return;
    
    const layer = {
      style: {
        default: entry.Layer.style.default
      },
      featureLookup: response,
      mapview: entry.Layer.mapview
    }

    Object.assign(layer.style, entry.style)

    let drawer = mapp.ui.layers.panels.style(layer)

    console.log(drawer)

    entry.node.append(drawer)

    entry.L = new ol.layer.VectorTile({
      source: entry.Layer.L.getSource(),
      renderBuffer: 200,
      zIndex: entry.zIndex,
      style: mapp.layer.Style(layer)
    });
   
    entry.Layer.clones.add(entry.L)
    mapview.Map.addLayer(entry.L)
    
    entry.location.removeCallbacks.push(()=>{
      entry.location.layer.mapview.Map.removeLayer(entry.L)
      entry.Layer.clones.delete(entry.L)
    })
  }

}