/**
Exports the numeric entries method.

@module /ui/locations/entries/numeric
*/

/**
@function numeric

@description
Returns a numeric entry node for the location.view.

The string value displayed in the location view will be formatted according to the formatterParams.

The mapp.language property value will be assigned as default locale for localeString formatting.

Formatting will be surpressed if the formatterParams are set to null.

@param {infoj-entry} entry type:numeric or type:integer infoj-entry typedef object.
@property {numeric} entry.value The entry value.
@property {numeric} [entry.newValue] The new ntry value not yet stored.
@property {Object} [entry.formatterParams] Configuration for the localeString number format.
@property {String} [entry.suffix] Suffix appended to stringValue.
@property {String} [entry.prefix] Prefix prepended to stringValue.
@property {Object} [entry.edit] Editing config for entry.

@returns {HTMLElement} Element to display a string of numeric entry value.
*/
export default function numeric(entry) {
  if (entry.edit) return edit(entry);

  if (entry.value === null || isNaN(entry.value)) return;

  mapp.utils.formatNumericValue(entry);

  return mapp.utils.html.node`<div 
    class="val"
    style=${entry.css_val}
    >${entry.stringValue}`;
}

/**
@function edit

@description
Returns a numeric input for editing numeric or integer type entries.

Will return a slider element if edit.range is true. A slider element can only be returned if the current value is valid.

Numeric entry edits must be bound by min and max.

Defaults for non big integer will be applied if missing.

@param {infoj-entry} entry type:numeric or type:integer infoj-entry typedef object.
@property {numeric} entry.value The entry value.
@property {Object} entry.edit Editing config for entry, can be Boolean.

@returns {HTMLElement} Input element to modify numeric entry value.
*/
function edit(entry) {
  // Assign callback method to dispatch valChange event.
  entry.edit.callback ??= () => {
    entry.location.view?.dispatchEvent(
      new CustomEvent('valChange', { detail: entry }),
    );
  };

  // Set limits for editing.
  entry.edit.min ??= entry.min || -2147483648;
  entry.edit.max ??= entry.max || 2147483647;
  entry.edit.step ??= entry.step || entry.type === 'integer' ? 1 : 0.1;

  Object.assign(entry, entry.edit);

  // A new value might be set as entry.default
  const value = entry.value ?? entry.newValue;

  // Range must be shown when value is 0 and in range.
  if (
    entry.edit.range &&
    !isNaN(value) &&
    value > entry.min &&
    value < entry.max
  ) {
    return mapp.ui.elements.slider(entry);
  }

  return mapp.ui.elements.numericInput(entry);
}
