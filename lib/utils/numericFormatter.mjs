/**
@module /utils/numericFormatter
*/

/**
@function formatNumericValue

@description
The formatNumericValue method will attempt to format params.newValue or params.value as localeString by passing the formatterParams to the localeString() method.

0 must be 0.

NULL is a number and must be parsed as float to be not a number [!isNaN].

The prefix and suffix are concatenated with the localString as params.stringValue.

Unless the formatterParams are NULL the mapp.language property will be assigned as locale for the localeString.

The maximumFractionDigits will be set to 0 for integer type params.

The maximumFractionDigits can be configured as params.round property.

@param {Object} params The config object argument.
@property {String} params.suffix Suffix appended to stringValue.
@property {String} params.prefix Prefix prepended to stringValue.
@property {Object} params.formatterParams Configuration for the localeString creation.
@property {String} [params.type] "integer" type params must be formatted with maximumFractionDigits=0.
@property {Integer} [params.round] The round value will be assigned as maximumFractionDigits for the localeString options argument.

@returns {string} The concatenated stringValue.
*/
export function formatNumericValue(params) {

  // suffix and prefix should be empty string if undefined.
  params.prefix ??= ''
  params.suffix ??= ''

  // numericValue must not be a number if either value is null.
  const numericValue = params.newValue !== undefined
    ? parseFloat(params.newValue)
    : parseFloat(params.value)

  params.localeString = ''

  if (params.formatterParams === undefined) {

    // Assign default formatterParams.
    params.formatterParams = {
      locale: mapp.language
    }
  }

  if (params.formatterParams === null && !isNaN(numericValue)) {

    // Assign numericValue as string if formatterParams are null.
    params.localeString = numericValue.toString()

  } else if (!isNaN(numericValue)) {

    // Assign mapp.language as default locale.
    params.formatterParams.locale ??= mapp.language;

    params.formatterParams.options ??= {}

    // "integer" type values must not have fraction digits.
    params.formatterParams.options.maximumFractionDigits ??= params.round || params.type === 'integer' ? 0 : 2

    params.localeString = numericValue.toLocaleString(
      params.formatterParams.locale,
      params.formatterParams.options)
  }

  // The trailing fraction character will be store by the unformatStringvalue method if present.
  params.trailingFraction ||= ''

  params.stringValue = `${params.prefix}${params.localeString}${params.trailingFraction}${params.suffix}`

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
    stringValue = stringValue.replace(params.prefix, '')
  }

  if (params.suffix) {

    // Remove suffix string.
    stringValue = stringValue.replace(params.suffix, '')
  }

  if (stringValue.length && params.formatterParams?.locale) {

    // Determine decimal separator and fraction characters. 
    const chars = (1234.5).toLocaleString(params.formatterParams?.locale).match(/(\D+)/g);

    // Remove the decimal separator from stringValue.
    stringValue = stringValue.split(chars[0]).join('');

    // Store a trailing fraction character.
    params.trailingFraction = stringValue.charAt(stringValue.length - 1) === chars[1] && chars[1]

    // Replace the fraction character with dot in stringValue.
    stringValue = stringValue.split(chars[1]).join('.');
  }

  if (stringValue === '') return null;

  return parseFloat(stringValue);
}
