/**
### mapp.ui.elements.numericFormatter{}

 module provides methods to format numeric import using formatterParams supplied on the entries.

The mapp.ui.elements.numericFormatter module provides methods to format numeric import using 
formatterParams supplied on the entries.

@module /ui/elements/numericFormatter
*/

/**
Returns the decimal and thousand separators produced by toLocaleString or formatterParams 
@param {Object} entry - An infoj entry object.
@function getSeparators
@returns {Object} - An Object containing the two keys, thousands and decimals e.g `{ thousands: ',', decimals: '.'}`.
*/
export function getSeparators(entry) {
  //Do nothing if entry is null or no formatter is present
  if (!entry) return;
  if (!entry.formatter) return { decimals: '.' };
  entry.prefix = ''
  entry.suffix = ''
  //Use a number to determin what the fields 
  //formatted input would look like
  entry.value = 1000000.99
  return getFormatterParams(entry).separators
}

function getFormatterParams(entry, inValue) {
  let value = entry.value || inValue;
  entry.prefix ??= ''
  entry.suffix ??= ''

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
    return { value: `${entry.prefix}   ${entry.suffix}`, separators: { thousands: '', decimals: '' } }
  }

  //Framework formatter type
  if (entry.formatter === 'toLocaleString') {
    entry.formatterParams ??= { locale: navigator.language }
  }

  //Tabulator formatterOptions
  if (entry.formatterParams?.decimal || entry.formatterParams?.thousand) {
    rawValue = parseFloat(value)
    let rawList = rawValue.toLocaleString('en-GB', entry.formatterParams.options).split('.')
    rawList[0] = rawList[0].replaceAll(',', entry.formatterParams.thousand)
    rawValue = rawList.join(entry.formatterParams.decimal || '.')
  } else {

    //Infoj formatter options
    entry.formatterParams ??= { locale: 'en-GB' }
    rawValue = parseFloat(value).toLocaleString(entry.formatterParams.locale, entry.formatterParams.options)
  }

  //Add The affixes
  let formattedValue = `${entry.prefix}${rawValue}${entry.suffix}`

  //Look for separators in formatterOptions.
  let separators = [entry.formatterParams?.thousand, entry.formatterParams?.decimal]
  let localeSeparators = Array.from(new Set(formattedValue.match(/\D/g)))

  //If not supplied look in the formatted string
  separators[0] = separators[0] ? separators[0] : localeSeparators[0]
  separators[1] = separators[1] ? separators[1] : localeSeparators[1] || '.'

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
  if (!entry.formatter) return entry.value || inValue;
  entry.prefix = ''
  entry.suffix = ''
  entry.value = inValue || entry.value

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