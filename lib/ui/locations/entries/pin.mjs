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

/**
## ui/locations/entries/pin

The pin entry module exports the pin method as mapp.ui.locations.entries.pin()

@module /ui/locations/entries/pin
*/

/**
@function pin

@description
### mapp.ui.locations.entries.pin()

Places a pin on the selected location on the map. A checkbox is supplied to turn the pin on and off.

@param {infoj-entry} entry type:pin entry.
@property {location} entry.location The entry location.
@property {array} entry.value An array containing entrys' co-ordinates.
@property {string} [entry.label] Label for checkbox element.
@property {boolean} [entry.display] The pin display flag.
@property {string} [entry.srid] The srid of the pin.
@property {integer} [entry.zIndex] The html layer on which the pin should display.
@property {object} [entry.style] Style properties of the pin which may include a scale.
@return {HTMLElement} Location pin and display checkbox.
*/


export default function pin(entry) {

  if (!Array.isArray(entry.value)) {

    console.warn(`Entry type pin requires a value array.`)
    return;
  }

  const default_icon = {
    type: 'markerLetter',
    letter: entry.location.record.symbol,
    color: entry.location.record.colour,
    scale: entry.style?.scale || 3,
    anchor: [0.5, 1]
  }

  // Assign srid from location.layer if not implicit.
  entry.srid ??= entry.location.layer.srid

  // Remove existing pin layer
  entry.location.layer.mapview.Map.removeLayer(entry.L)

  entry.zIndex ??= Infinity

  if (entry.style) {
    entry.style.icon = default_icon
  }

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
    checked: true,
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