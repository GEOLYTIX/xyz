export default entry => {

  entry.srid = entry.srid || entry.location.layer.srid

  // Remove existing pin layer
  entry.location.layer.mapview.Map.removeLayer(entry.L)

  entry.L = entry.location.layer.mapview.geoJSON({
    zIndex: Infinity,
    geometry: {
      type: 'Point',
      coordinates: entry.value,
    },
    dataProjection: entry.srid,
    Style: entry.Style || entry.location.pinStyle
  })

  // entry.location.removeCallbacks?.push(function(){
  //   entry.location.layer.mapview.Map.removeLayer(entry.L)
  // })

  entry.location.Layers.push(entry.L)

  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || 'Pin',
    checked: true,//!!entry.display,
    onchange: (checked) => {
      entry.display = checked
      checked ?
        entry.location.layer.mapview.Map.addLayer(entry.L) :
        entry.location.layer.mapview.Map.removeLayer(entry.L);
    }
  })

  const node = mapp.utils.html.node`${chkbox}`

  return node
}