/**
Exports the numeric entries method.

@module /ui/elements/numericInput
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
@property {Object} [entry.edit] Editing config for entry.
@property {Object} [entry.formatterParams] Params for the value formatting.

@returns {HTMLElement} Element to display a string of numeric entry value.
*/
export default function numeric(entry) {

  // It must be possible to suppress formatting.
  if (entry.formatterParams !== null) {

    entry.formatterParams ??= {}
  
    entry.formatterParams.locale ??= mapp.language;
  
    entry.formatterParams.options ??= {}
  
    if (entry.type === 'integer') {
  
      // type integer entries must not display any fraction digits.
      entry.formatterParams.options.maximumFractionDigits = 0
  
    } else {
  
      // type numeric entries show 2 fraction digits by default.
      entry.formatterParams.options.maximumFractionDigits ??= entry.round || 2;
    }
  }

  if (entry.edit) return edit(entry)

  if (entry.value === null || isNaN(entry.value)) return;

  mapp.utils.formatNumericValue(entry)
  
  return mapp.utils.html.node`<div 
    class="val"
    style=${entry.css_val}
    >${entry.stringValue}`;
}

/**
@function edit

@description
Returns a numeric input for editing numeric or integer type entries.

@param {infoj-entry} entry type:numeric or type:integer infoj-entry typedef object.
@property {numeric} entry.value The entry value.
@property {numeric} [entry.newValue] The new ntry value not yet stored.
@property {Object} [entry.edit] Editing config for entry.
@property {Object} [entry.formatterParams] Params for the value formatting.

@returns {HTMLElement} Input element to modify numeric entry value.
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
  }

  if (entry.edit.range) {

    entry.edit.min ??= entry.edit.range.min || -2147483648
    entry.edit.max ??= entry.edit.range.max || 2147483648
    entry.edit.step ??= entry.edit.range.step || 0.1

    // // Create and return a range slider element.
    // const oldValue = entry.value

    // let formattedVal = mapp.utils.numericFormatter({
    //   ...entry,
    //   ...{ value: entry.newValue || entry.value }
    // })

    // formattedVal = formattedVal
    //   ? formattedVal.replace(entry.prefix, '').replace(entry.suffix, '')
    //   : null

    return mapp.ui.elements.slider({
      //val: formattedVal,
      ...entry,
      ...entry.edit,
      // slider: Number(entry.newValue || entry.value),
      // oldValue: oldValue,
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

  Object.assign(entry, entry.edit)

  entry.callback ??= editCallback(entry)

  return mapp.ui.elements.numericInput(entry)
}

function editCallback(entry) {

  return value => {

    entry.newValue = value;

    if(entry.invalid) {
      entry.newValue = entry.oldValue
    }
  
    entry.location.view?.dispatchEvent(
      new CustomEvent('valChange', { detail: entry })
    );
  }
}
