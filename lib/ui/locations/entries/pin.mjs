mapp.utils.merge(mapp.dictionaries, {
  'en': {
    pin: 'Pin',
  },
  'de': {
    pin: 'Pin',
  },
  'zh': {
    pin: '标注',
  },
  'zh_tw': {
    pin: '標注',
  },
  'pl': {
    pin: 'Oznacz',
  },
  'fr': {
    pin: 'Marquer',
  },
  'ja': {
    pin: 'ピン',
  },
  'esp': {
    pin: 'Marcar',
  },
  'tr': {
    pin: 'Sabitle',
  },
  'it': {
    pin: 'Pin'
  },
  'th': {
    pin: 'เข็มหมุด',
  },
})

export default entry => {

  if (!Array.isArray(entry.value)) {

    console.warn(`Entry type pin requires a value array.`)
    return;
  }

  // Assign srid from location.layer if not implicit.
  entry.srid ??= entry.location.layer.srid

  // Remove existing pin layer
  entry.location.layer.mapview.Map.removeLayer(entry.L)

  entry.zIndex ??= Infinity

  entry.Style ??= entry.style ? mapp.utils.style(entry.style) : entry.location.pinStyle

  entry.geometry = {
    type: 'Point',
    coordinates: entry.value,
  }

  entry.L = entry.location.layer.mapview.geoJSON(entry)

  entry.location.layer.display && entry.location.layer.L?.changed()

  entry.location.Layers.push(entry.L)

  const chkbox = mapp.ui.elements.chkbox({
    label: `${entry.label || mapp.dictionary.pin}`,
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