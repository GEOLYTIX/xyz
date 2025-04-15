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
  params.prefix ??= '';
  params.suffix ??= '';

  // numericValue must not be a number if either value is null.
  const numericValue =
    params.newValue !== undefined
      ? parseFloat(params.newValue)
      : parseFloat(params.value);

  params.localeString = '';

  if (params.formatterParams === undefined) {
    // Assign default formatterParams.
    params.formatterParams = {
      locale: mapp.language,
    };
  }

  if (params.formatterParams === null && !isNaN(numericValue)) {
    // Assign numericValue as string if formatterParams are null.
    params.localeString = numericValue.toString();
  } else if (!isNaN(numericValue)) {
    // Assign the browser language as locale if not provided in formatterParams, otherwise use mapp.language.
    params.formatterParams.locale ??= navigator.language || mapp.language;

    params.formatterParams.options ??= {};

    // "integer" type values must not have fraction digits.
    params.formatterParams.options.maximumFractionDigits ??=
      params.round || params.type === 'integer' ? 0 : 2;

    // Format a numeric value into a localized string representation
    params.localeString = new Intl.NumberFormat(
      params.formatterParams.locale,
      params.formatterParams.options,
    ).format(numericValue);
  }

  // The trailing fraction character will be store by the unformatStringvalue method if present.
  params.lastCharacter ||= '';

  params.stringValue = `${params.prefix}${params.localeString}${params.lastCharacter}${params.suffix}`;

  return params.stringValue;
}

/**
 * Unformats a string value by removing prefix, suffix, and locale-specific formatting.
 *
 * @function unformatStringValue
 * @description
 * This function removes the specified prefix and suffix from the input string,
 * then unformats the remaining value based on the provided locale settings.
 * It handles locale-specific decimal separators and removes non-numeric characters.
 * The resulting numeric value is returned as a parsed float.
 *
 * @param {Object} params - The configuration object.
 * @param {string} params.stringValue - The input string to be unformatted.
 * @param {string} [params.prefix] - Prefix to be removed from stringValue.
 * @param {string} [params.suffix] - Suffix to be removed from stringValue.
 * @param {Object} [params.formatterParams] - Configuration for locale-specific formatting.
 * @param {string} [params.formatterParams.locale] - The locale to use for unformatting (e.g., 'en-US', 'de-DE').
 *
 * @returns {number|null} The numeric value extracted from the stringValue, or null if the input is empty or invalid.
 */
export function unformatStringValue(params) {
  if (!params.stringValue) return null;

  let stringValue = params.stringValue;

  if (params.prefix) {
    // Remove prefix string.
    stringValue = stringValue.replace(params.prefix, '');
  }

  if (params.suffix) {
    // Remove suffix string.
    stringValue = stringValue.replace(params.suffix, '');
  }

  if (stringValue.length && params.formatterParams?.locale) {
    // Create a number formatter using the specified locale
    const numberFormatter = new Intl.NumberFormat(
      params.formatterParams.locale,
    );

    // Get the parts of a formatted number (1.1 is used as an example)
    const parts = numberFormatter.formatToParts(10000.1);

    // Find the decimal separator used in this locale
    const decimalSeperator = parts.find(
      (part) => part.type === 'decimal',
    )?.value;

    //Find the thousand seperator used in the locale
    const thousandSeperator = parts.find(
      (part) => part.type === 'group',
    )?.value;

    // Replace the locale-specific decimal separator with a standard period
    let normalisedValue = stringValue.replaceAll(thousandSeperator, '');

    // Replace the locale-specific decimal separator with a standard period
    normalisedValue = normalisedValue.replace(decimalSeperator, '.');

    // Remove any non-numeric characters, except for period and minus sign
    const cleanedValue = normalisedValue.replace(/[^\d.-]/g, '');

    //Delete the lastCharacter param
    delete params.lastCharacter;

    // Preserve fraction character at end of stringValue
    if (stringValue.endsWith(decimalSeperator)) {
      params.lastCharacter = decimalSeperator;
    }

    // Preserve 0 fraction at end of stringValue
    if (stringValue.endsWith(decimalSeperator + 0)) {
      params.lastCharacter = decimalSeperator + 0;
    }

    // Parse the cleaned string into a float (decimal) number
    stringValue = parseFloat(cleanedValue);

    return stringValue;
  }

  if (stringValue === '') return null;

  return parseFloat(stringValue);
}
