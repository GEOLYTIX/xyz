/**
 * Utility module for transforming between Unix timestamp integers and formatted date strings.
 * Supports various date/time formats and localization options.
 * @module /utils/temporal
 */
const DEFAULT_LOCALE = 'en-GB';
const MILLISECONDS_IN_SECOND = 1000;

/**
 * Safely converts Unix timestamp to JavaScript Date object
 * @private
 * @param {number} unixTimestamp - Unix timestamp in seconds
 * @returns {Date} JavaScript Date object
 * @throws {Error} If timestamp is invalid
 */
function toJSDate(unixTimestamp) {
  if (!Number.isInteger(unixTimestamp)) {
    throw new Error('Invalid timestamp: must be an integer');
  }
  return new Date(unixTimestamp * MILLISECONDS_IN_SECOND);
}

/**
 * Formats a Unix timestamp into a localized date string
 * @param {Object} params - Input parameters
 * @property {number} params.value - Unix timestamp in seconds
 * @property {number} [params.newValue] - Updated timestamp value (takes precedence over value)
 * @property {string} [params.locale=en-GB] - Locale identifier
 * @property {Intl.DateTimeFormatOptions} [params.options] - Formatting options
 * @returns {string} Formatted date string
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat|Intl.DateTimeFormat}
 */
function dateString(params) {
  params.locale ??= DEFAULT_LOCALE;

  if (!params.value && !params.newValue) {
    throw new Error('Either value or newValue must be provided');
  }

  const timestamp = params.newValue || params.value;
  const date = toJSDate(timestamp);

  return new Intl.DateTimeFormat(params.locale, params.options).format(date);
}

/**
 * Converts a date string to Unix timestamp
 * @param {string} [dateStr] - Date string parseable by JavaScript Date
 * @returns {number} Unix timestamp in seconds
 * @throws {Error} If date string is invalid
 */
function dateToUnixEpoch(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string provided');
  }
  return Math.floor(date.getTime() / MILLISECONDS_IN_SECOND);
}

/**
 * Formats Unix timestamp to ISO datetime string (YYYY-MM-DDThh:mm:ss)
 * @param {Object} params - Input parameters
 * @property {number} params.value - Unix timestamp in seconds
 * @property {number} [params.newValue] - Updated timestamp value
 * @returns {string} ISO datetime string without timezone
 */
function datetime(params) {
  const timestamp = params.newValue || params.value;
  const date = toJSDate(timestamp);

  return date.toISOString().split('.')[0];
}

/**
 * Formats Unix timestamp to ISO date string (YYYY-MM-DD)
 * @param {Object} params - Input parameters
 * @property {number} params.value - Unix timestamp in seconds
 * @property {number} [params.newValue] - Updated timestamp value
 * @returns {string} ISO date string
 */
function date(params) {
  const timestamp = params.newValue || params.value;
  const date = toJSDate(timestamp);

  return date.toISOString().split('T')[0];
}

export const temporal = {
  dateString,
  dateToUnixEpoch,
  datetime,
  date
};