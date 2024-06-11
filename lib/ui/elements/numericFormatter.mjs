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
export function getSeparators(entry) {
  //Do nothing if entry is null or no formatter is present
  if (!entry) return;
  if (!entry.formatter && entry.type !== 'integer') return { decimals: '.' };
  //Use a number to determine what the fields 
  //formatted input would look like
  entry.value = 1000000.99
  return getFormatterParams(entry).separators
}

function getFormatterParams(entry, inValue) {
  let value = entry.value || inValue;
  let prefix = entry.prefix ??= ''
  let suffix = entry.suffix ??= ''
  let round = entry.round

  if (entry.filterInput) {
    prefix = ''
    suffix = ''
    round = null
  }

  if (!value) {
    return { value: null }
  }

  const negative = value[0] === '-'

  if (negative) {
    value = value.substring(1, value.length)
  }

  let rawValue;

  //Check if supplied value is a valid number
  if (isNaN(parseFloat(value))) {
    return { value: `${prefix}   ${suffix}`, separators: { thousands: '', decimals: '' } }
  }

  // Assign if nullish.
  entry.formatterParams ??= {};

  // Assign user language as locale if nullish but not null.
  if (entry.formatterParams.locale !== null || entry.formatter === 'toLocaleString') {
    entry.formatterParams.locale ??= mapp.language;
  }

  //Setup formatter options for rounding
  entry.formatterParams.options ??= {}
  entry.formatterParams.options.maximumFractionDigits ??= entry.formatterParams.precision ??= round
  entry.formatterParams.options.minimumFractionDigits ??= entry.formatterParams.precision ??= round
  //Tabulator formatterOptions
  if (entry.formatterParams?.decimal || entry.formatterParams?.thousand) {
    entry.formatterParams.decimal ??= '.'
    rawValue = parseFloat(value)

    let rawList = rawValue.toLocaleString('en-GB', entry.formatterParams.options).split('.')
    rawList[0] = rawList[0].replaceAll(',', entry.formatterParams.thousand)
    rawValue = rawList.join(entry.formatterParams.decimal)
  } else {
    //Infoj formatter options
    rawValue = parseFloat(value).toLocaleString(entry.formatterParams.locale, entry.formatterParams.options)
  }

  //Add The affixes
  let formattedValue = `${prefix}${rawValue}${suffix}`

  //Look for separators in formatterOptions.
  let separators = [entry.formatterParams?.thousand, entry.formatterParams?.decimal]
  let localeSeparators = Array.from(new Set(formattedValue.match(/\D/g)))
  localeSeparators[1] ??= '.'

  //If not supplied look in the formatted string
  separators[0] = separators[0] ? separators[0] : localeSeparators[0]
  separators[1] = separators[1] ? separators[1] : localeSeparators[1]

  formattedValue = `${negative ? '-' : ''}${formattedValue}`
  return { value: formattedValue, separators: { thousands: separators[0], decimals: separators[1] } }
}

function undoFormatting(entry) {

  //Determine thousand and decimal markers
  let value = entry.value
  if (!entry.value) return null;

  const separators = getSeparators(entry)
  const negative = value[0] === '-'
  value = negative ? value.substring(1, value.length) : value

  //Strip out thousand and decimal markers, replacing decimal with '.'
  value = value.replaceAll(separators.thousands, '')

  if (separators.decimals) {
    value = separators.decimals === '.' || separators.decimals === '' ? value : value.replace(separators.decimals, '.')
  }

  if (!Number(value)) {
    value = value.replaceAll(/\D+/g, '');
  }

  return `${negative ? '-' : ''}${value}`
}

/**
Returns the formatted string based on the provided formatterParams or locale
@param {Object} entry - An infoj entry object.
@param {Integer|String} inValue - The value to be formatted if not available in the entry.
@param {Boolean} reverse - A true false value specifying whether the formatting should be removed or applied.
@returns {Integer|String} - Either the fomatted string (`reverse=false`) or the numeric value(`reverse=true`). 
*/
export function numericFormatter(entry, inValue, reverse) {

  //Do nothing if entry is null or no formatter is present
  if (!entry) return entry.value || inValue;
  if (!entry.formatter && entry.type !== 'integer') return entry.value || inValue;

  // If value is 0, return 0
  if (inValue === 0) return 0;

  // If formatter is money - use en-GB locale
  if (entry.formatter === 'money') {
    entry.formatterParams ??= {}
    entry.formatterParams.locale = 'en-GB'
  };

  entry.value = inValue || entry.value

  if(!entry.formatterParams?.locale) return entry.value;
  
  //Do the opposite of formatting
  if (reverse) {
    return undoFormatting(entry)
  }

  //Get the actual formatted value
  return getFormatterParams(entry).value
}

export default {
  numericFormatter,
  getSeparators
}