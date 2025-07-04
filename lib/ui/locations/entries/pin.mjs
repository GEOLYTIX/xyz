/**
## ui/locations/entries/pin

The pin entry module exports the pin method as mapp.ui.locations.entries.pin()

Dictionary entries:
- pin

@requires /dictionary 

@module /ui/locations/entries/pin
*/

/**
@function pin

@description
Places a pin on the selected location on the map. A checkbox is supplied to turn the pin on and off.

The pin will be styled by the entry.style property if provided. Otherwise the location.pinStyle assigned by the locations [listview]{@link module:/ui/locations/listview~listview} method will be used. A location may not have a pinStyle if no listview has been configured for the mapview.

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
    console.warn(`Entry type pin requires a value array.`);
    return;
  }

  // Assign srid from location.layer if not implicit.
  entry.srid ??= entry.location.layer.srid;

  // Remove existing pin layer
  entry.location.layer.mapview.Map.removeLayer(entry.L);

  entry.zIndex ??= Infinity;

  entry.Style ??= entry.style
    ? mapp.utils.style(entry.style)
    : entry.location.pinStyle;

  entry.srid ??= entry.location.layer.srid;

  entry.geometry = {
    coordinates: entry.value,
    type: 'Point',
  };

  if (entry.L) {
    entry.location.layer.mapview.Map.removeLayer(entry.L);

    // Layer object must be filtered from the Layers array before being deleted.
    entry.location.Layers = entry.location.Layers.filter(
      (L) => L.ol_uid !== entry.L.ol_uid,
    );

    delete entry.L;
  }

  entry.L = entry.location.layer.mapview.geoJSON(entry);

  entry.location.layer.display && entry.location.layer.L?.changed();

  entry.location.Layers.push(entry.L);

  entry.getExtent = () => getExtent(entry);

  //Add the extent function to the locations Extents
  entry.location.Extents[entry.key] = async () => await entry.getExtent();

  const chkbox = mapp.ui.elements.chkbox({
    checked: true,
    label: `${entry.label || mapp.dictionary.pin}`,
    onchange: (checked) => {
      entry.display = checked;
      checked
        ? entry.location.layer.mapview.Map.addLayer(entry.L)
        : entry.location.layer.mapview.Map.removeLayer(entry.L);

      //Remove/add extent function the locations Extents
      if (checked)
        entry.location.Extents[entry.key] = async () => await this.getExtent();
      else delete entry.location.Extents[entry.key];
    },
  });

  const node = mapp.utils.html.node`${chkbox}`;

  return node;
}

/**
@function getExtent
@async

@description
Calculates the extent of the pin. Applies a buffer if one has been supplied to the pin.

@param {infoj-entry} entry type:pin entry.
@property {boolean|number} [entry.buffer] a value to buffer the pin with or just true for a default of 200.
@returns {Promise<Array>} an array representing an openlayers extent.
*/
async function getExtent(entry) {
  if (entry.buffer) {
    return ol.extent.buffer(
      entry.L.getSource().getExtent(),
      entry.buffer > 200 ? entry.buffer : 200,
    );
  }

  return entry.L.getSource().getExtent();
}
