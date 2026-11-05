/**
## mapp.utils.convert()

@module /utils/convert
*/

let promise, convertUnits;

async function moduleImport() {
  if (!promise)
    promise = new Promise((resolve) => {
      import('https://cdn.skypack.dev/convert@4').then((mod) => {
        convertUnits = mod.convert;
        resolve();
      });
    });

  await promise;
}

/**
@function convert
@async

@description
Formats a numeric value as string. The value is converted from the params.units to the params.convertTo units with the [convert]{@link https://www.npmjs.com/package/convert} module, which is imported on the first call.

@param {number|string} value The value to format.
@param {Object} params The format params.
@property {string} [params.units] The units of the value.
@property {string} [params.convertTo] The units to convert the value to.
@property {number} [params.decimals=0] The number of decimals.
@property {string} [params.locale='en-GB'] The locale for the number format.
@property {string} [params.prefix] A prefix for the formatted value.
@property {string} [params.suffix] A suffix for the formatted value.
@returns {Promise<string>} The formatted value.
*/
export default async function convert(value, params) {
  await moduleImport();

  value = Number.parseFloat(value);

  if (params.units && params.convertTo) {
    value = convertUnits(value, params.units).to(params.convertTo);
  }

  value = value.toFixed(params.decimals || 0);

  value = value.toLocaleString(params.locale || 'en-GB');

  return `${params.prefix || ''}${value}${params.suffix || ''}`;
}
