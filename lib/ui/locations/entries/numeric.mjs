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

  entry.formatter ??= 'toLocaleString';

  entry.formatterParams ??= {
    locale: 'en-GB'
  }

  entry.formatterParams.options ??= {}

  if(!Object.keys(entry.formatterParams).includes('locale')){
    entry.formatterParams.locale = mapp.language;
  }

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
  const localeValue = entry.formatterParams.locale ? parseFloat(entry.value).toLocaleString(entry.formatterParams.locale, entry.formatterParams.options) : parseFloat(entry.value)

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
    const oldValue = entry.value
    let formattedVal = mapp.utils.numericFormatter({... entry, ...{ value : entry.newValue || entry.value} })
    formattedVal = formattedVal ? formattedVal.replace(entry.prefix,'').replace(entry.suffix,'') : null
    return mapp.ui.elements.slider({
      min: entry.edit.range.min ??= -2147483648,
      max: entry.edit.range.max ??= 2147483647,
      entry: entry,
      val: formattedVal,
      slider: Number(entry.newValue || entry.value),
      step: entry.edit.range.step,
      oldValue: oldValue,
      callback: e => {

        e.target.value = mapp.utils.numericFormatter({...entry,...{value: e.target.value, undo: true}})

        entry.newValue = entry.type === 'integer'
          ? parseInt(e.target.value)
          : parseFloat(e.target.value);

        if(isNaN(entry.newValue)){
          entry.newValue = null
        }

        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', { detail: entry })
        );

        if(e.target.type === 'text'){
          const formattedNewValue = mapp.utils.numericFormatter({...entry,...{value: e.target.value}})
          e.target.value = formattedNewValue ? formattedNewValue.replace(entry.suffix,'').replace(entry.prefix,'') : e.target.value
        }
      }
    });
  }

  entry.callback ??= editCallback

  return mapp.ui.elements.numericInput(entry)
}

function editCallback(value) {

  this.newValue = value;

  if(this.invalid) {
    this.newValue = this.oldValue
  }

  this.location.view?.dispatchEvent(
    new CustomEvent('valChange', { detail: this })
  );
}
