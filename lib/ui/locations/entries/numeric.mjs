/**
### mapp.ui.locations.entries.numeric()

Exports the numeric entries method.

@module /ui/elements/numericInput
*/

/**
@function numeric

@description
Returns a numeric entry node for the location.view.

@param {Object} entry The entry object.
@param {numeric} entry.value The entry value.
@param {numeric} [entry.newValue] The new ntry value not yet stored.
@param {Object} [entry.edit] Editing config for entry.
@param {Object} [entry.formatterParams] Params for the value formatting.

@returns {Object} Numeric entry elements.
*/

export default function numeric(entry) {

  entry.formatterParams ??= {}

  entry.formatterParams.options ??= {}

  entry.formatterParams.locale ??= mapp.language;

  if (entry.type === 'integer') {

    // If integer, set maximumFractionDigits to 0
    entry.formatterParams.options.maximumFractionDigits = 0

  } else {

    // Set rounding to entry.round or 2 if not defined
    entry.formatterParams.options.maximumFractionDigits ??= entry.round || 2;
  }

  if (entry.edit) return edit(entry)

  if (entry.value === null || isNaN(entry.value)) return;
  
  // Create localeValue string from float.
  const localeValue = parseFloat(entry.value).toLocaleString(entry.formatterParams.locale, entry.formatterParams.options)

  return mapp.utils.html.node`
    <div class="val" style=${entry.css_val}>
    ${entry.prefix}${localeValue}${entry.suffix}`;

}

/**
@function edit

@description
Returns a numeric entry node for the location.view.

@param {Object} entry The entry object.
@param {numeric} entry.value The entry value.
@param {numeric} [entry.newValue] The new ntry value not yet stored.
@param {Object} [entry.edit] Editing config for entry.
@param {Object} [entry.formatterParams] Params for the value formatting.

@returns {Object} Numeric inputs for editing the entry.value
*/

function edit(entry) {

  if (entry.edit === true) {

    entry.edit = {}
  }

  if (entry.type === 'integer') {

    // Max size for postgres integer values
    entry.edit.min ??= -2147483648
    entry.edit.max ??= 2147483647
    entry.edit.step ??= 1
  } else {

    entry.edit.step ??= 0.1
  }

  if (entry.edit.range) {

    // Create and return a range slider element.
    return mapp.ui.elements.slider({
      min: entry.edit.range.min,
      max: entry.edit.range.max,
      val: entry.newValue || entry.value,
      callback: e => {
        entry.newValue = entry.type === 'integer'
          ? parseInt(e.target.value)
          : parseFloat(e.target.value);

        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', { detail: entry })
        );
      }
    });
  }

  if (entry.formatterParams.input) {

    return mapp.utils.html.node`<input
      value=${mapp.ui.elements.numericFormatter(entry)}
      onFocus=${e => onFocus(e, entry)}
      onBlur=${e => onBlur(e, entry)}
      placeholder=${entry.edit.placeholder}
      onkeyup=${e => handleKeyUp(e, entry)}>`;
  }

  return mapp.ui.elements.numericInput({
    entry: entry,
    value: entry.newValue || entry.value,
    placeholder: entry.edit.placeholder,
    maxlength: entry.edit.maxlength,
    min: entry.edit.min,
    max: entry.edit.max,
    step: entry.edit.step,
    callback: (value, entry) => {

      if (value === 0) {
        entry.newValue = 0;
      } else entry.newValue = value;

      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', { detail: entry })
      );
    }
  })
}

function onFocus(e, entry) {
  e.target.value = parseFloat(entry.newValue || entry.value)
  e.target.type = 'number';
}

function onBlur(e, entry) {
  e.target.type = '';
  e.target.value = mapp.ui.elements.numericFormatter(entry)
}

function handleKeyUp(e, entry) {

  if (entry.type === 'integer') {
    e.target.value = parseInt(e.target.value);
  }

  if (entry.type === 'numeric') {
    e.target.value = parseFloat(e.target.value);
  }

  if (e.target.value === 0) {
    entry.newValue = 0;
  }

  if(!e.target.value) {
    entry.newValue = null 
  } else {

    entry.newValue = e.target.value;
  }

  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', { detail: entry })
  );
}