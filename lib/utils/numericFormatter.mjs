/**
@module /utils/numericFormatter
*/

/**
@function numericFormatter

@description
Returns the formatted string based on the provided formatterParams.

@param {Object} params An infoj entry or compliant object.
@param {Boolean} entry.undo - removes formatting
Method returns numeric value if true.

@returns {string} Returns formatted string from numeric value without the numeric flag.
*/
export function numericFormatter(params) {

  params.formatter ??= 'toLocaleString';

  // do nothing if no formatter
  if (!params.formatter || !params.value) return params.value;

  //do nothing if locale is present but null
  //if (Object.keys(params?.formatterParams).includes('locale') && !params.formatterParams.locale) return params.value

  // always add formatter params + default locale
  params.formatterParams ??= {
    locale: 'en-GB'
  };

  //Do the opposite of formatting
  if (params.undo) return undoFormatting(params)

  // Get the actual formatted value
  return getFormatterParams(params).value
}

function getFormatterParams(params) {

  let value =  params.value || params.formatValue
  let prefix = params.prefix ??= '';
  let suffix = params.suffix ??= '';
  let round = params.round;

  if (params.filterInput) {
    prefix = ''
    suffix = ''
    round = null
  }

  if (!value && value !== 0) {
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

  // always add formatter params + default locale
  params.formatterParams ??= {
    locale: 'en-GB'
  };
  //Setup formatter options for rounding
  params.formatterParams.options ??= {}
  params.formatterParams.options.maximumFractionDigits ??= params.formatterParams.precision ??= round || 2

  //Tabulator formatterOptions
  if (params.formatterParams?.decimal || params.formatterParams?.thousand) {

    params.formatterParams.decimal ??= '.'

    rawValue = parseFloat(value)

    let rawList = rawValue.toLocaleString(params.formatterParams.locale, params.formatterParams.options).split('.')

    rawList[0] = rawList[0].replaceAll(',', params.formatterParams.thousand)
    rawValue = rawList.join(params.formatterParams.decimal)

  } else {
    //Infoj formatter options
    rawValue = params.formatterParams.locale ? parseFloat(value).toLocaleString(params.formatterParams.locale, params.formatterParams.options) : parseFloat(parseFloat(value).toFixed(params.formatterParams.options.maximumFractionDigits))
  }

  //Add The affixes
  let formattedValue = `${prefix}${rawValue}${suffix}`

  //Look for separators in formatterOptions.
  const separators = [params.formatterParams?.thousand, params.formatterParams?.decimal]

  const localeSeparators = Array.from(new Set(`${rawValue}`.match(/\D/g)))

  localeSeparators[1] ??= '.'

  //If not supplied look in the formatted string
  separators[0] = separators[0] ? separators[0] : localeSeparators[0]
  separators[1] = separators[1] ? separators[1] : localeSeparators[1]

  formattedValue = `${negative ? '-' : ''}${formattedValue}`

  return {
    value: formattedValue,
    separators: {
      thousands: separators[0],
      decimals: separators[1]
    }
  }
}

function undoFormatting(params) {

  //Determine thousand and decimal markers
  let value = params.value

  if (!params.value) return null;

  const separators = getSeparators({...params,...{value: 100000.99}})

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
@function getSeparators

@description
Returns an object containing decimal and thousand separator characters based on the provided formatterParams.

@param {Object} params An infoj entry or compliant object.
@returns {Object} Returns object containing the thousand and decimal separators created by the formatterParams.
*/
export function getSeparators(params) {

  //Do nothing if entry is null or no formatter is present
  if (!params) return;

  if (!params.formatter && params?.type !== 'integer') {
    return { decimals: '.' };
  }

  if (params.formatterParams
    && Object.keys(params.formatterParams).includes('locale')
    && !params.formatterParams.locale) {
    return { decimals: '.' }
  }

  //Use a number to determine what the fields 
  //formatted input would look like
  params.formatValue = 1000000.99

  return getFormatterParams(params).separators
}

/**
@function formatNumericValue

@description
The formatNumericValue method will attempt to format params.newValue or params.value as localeString by passing the formatterParams to the localeString() method.

0 must be 0.

NULL is a number and must be parsed as float to be not a number [!isNaN].

The prefix and suffix are concatenated with the localString as params.stringValue.

@param {Object} params The config object argument.
@property {String} params.suffix Suffix to append to the stringValue.
@property {String} params.prefix Prefix to prepend to the stringValue.
@property {Object} params.formatterParams Configuration for the localeString creation.

@returns {string} The concatenated stringValue.
*/
export function formatNumericValue(params) {

  params.prefix ??= ''
  params.suffix ??= ''

  // numericValue must not be a number if either value is null.
  const numericValue = params.newValue !== undefined
    ? parseFloat(params.newValue)
    : parseFloat(params.value)

  params.localeString = ''

  if (params.formatterParams?.locale && !isNaN(numericValue)) {

    params.localeString = numericValue.toLocaleString(
      params.formatterParams.locale,
      params.formatterParams.options)
  } else if (!isNaN(numericValue)) {

    // Assign numericValue as string if a number without a locale.
    params.localeString = numericValue.toString()
  }

  params.stringValue = `${params.prefix}${params.localeString}${params.suffix}`

  return params.stringValue
}

/**
@function unformatStringValue

@description
The unformatStringValue will splice the suffix and prefix from a stringValue and remove seperators as defined by the localeString locale.

The numeric value will be returned as parsed float.

@param {Object} params The config object argument.
@property {String} params.suffix Suffix to be removed from stringValue.
@property {String} params.prefix Prefix to be removed from stringValue.
@property {Object} params.formatterParams Configuration for the localeString.

@returns {numeric} A numeric value extracted from the stringValue.
*/
export function unformatStringValue(params) {

  if (!params.stringValue) return null;

  let stringValue = params.stringValue

  if (params.prefix) {

    // Remove prefix string.
    stringValue = stringValue.replace(params.prefix,'')
  }

  if (params.suffix) {

    // Remove suffix string.
    stringValue = stringValue.replace(params.suffix,'')
  }

  if (stringValue.length && params.formatterParams?.locale) {

    // Determine decimal separator and fraction characters. 
    const chars = (1234.5).toLocaleString(params.formatterParams?.locale).match(/(\D+)/g);

    // Remove the decimal separator from stringValue.
    stringValue = stringValue.split(chars[0]).join("");

    // Replace the fraction character with dot in stringValue.
    stringValue = stringValue.split(chars[1]).join(".");
  }

  if (stringValue === '') return null;

  return parseFloat(stringValue);
}
