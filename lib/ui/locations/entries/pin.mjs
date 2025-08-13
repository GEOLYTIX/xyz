/**
## ui/locations/entries/pin

The pin entry module exports the pin method as mapp.ui.locations.entries.pin()

Dictionary entries:
- pin

@requires /dictionary 
@requires /ui/elements/chkbox
@requires /ol/extent/buffer

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
@property {boolean} [entry.display=true] The pin display flag.
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

  entry.srid ??= entry.location.layer.srid;

  // Allow display to be false.
  entry.display ??= entry.display === undefined;

  entry.zIndex ??= Infinity;

  entry.Style ??= entry.style
    ? mapp.utils.style(entry.style)
    : entry.location.pinStyle;

  entry.show ??= show;
  entry.hide ??= hide;
  entry.getExtent ??= getExtent;

  entry.geometry = {
    coordinates: entry.value,
    type: 'Point',
  };

  entry.display && entry.show();

  entry.label ??= mapp.dictionary.pin;

  entry.chkbox ??= mapp.ui.elements.chkbox({
    checked: entry.display,
    label: entry.label,
    onchange: (checked) => {
      checked ? entry.show() : entry.hide();
    },
  });

  return entry.chkbox;
}

/**
@function show
@this infoj-entry

@description
Calls removeLayer method to remove layer from location before creating a new Openlayers layer which is pushed into the location.Layers array property.
*/
function show() {
  if (this.disabled) return;

  this.location.removeLayer(this);

  this.display = true;

  this.L = this.location.layer.mapview.geoJSON(this);

  this.location.Layers.push(this);
}

/**
@function hide
@this infoj-entry

@description
Sets the display property to false and calls the remove method.
*/
function hide() {
  this.display = false;
  this.location.removeLayer(this);
}

/**
@function getExtent
@this infoj-entry

@description
Calculates the extent of the pin. Applies a buffer if one has been supplied to the pin.

@param {infoj-entry} entry type:pin entry.
@property {boolean|number} [entry.buffer] a value to buffer the pin with or just true for a default of 200.
@returns {Array} Array representing Openlayers extent.
*/
function getExtent() {
  this.buffer ??= 0;

  this.buffer = parseInt(this.buffer) || 200;

  return ol.extent.buffer(this.L.getSource().getExtent(), this.buffer);
}
