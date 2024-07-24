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
