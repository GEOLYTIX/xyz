/**
## mapp.utils.convert()

@module /utils/convert
*/

/**
@function convert
@async

@description
Formats a numeric value as string. The value is converted from the params.units to the params.convertTo units with the [convert]{@link https://www.npmjs.com/package/convert} module. The module is imported from esm.sh with the mapp.utils.esmImport method on the first conversion.

The value is not converted if the module can't be imported. The esmImport method logs the error. The unconverted value is labelled with its source params.units instead of the params.suffix, so the measurement isn't mislabelled with the convertTo units.

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
  value = Number.parseFloat(value);

  let suffix = params.suffix;

  if (params.units && params.convertTo) {
    const convertModule = await mapp.utils.esmImport('convert@4');

    if (convertModule instanceof Error) {
      // The value can't be converted. Label it with its source units so the
      // measurement isn't mislabelled with the convertTo units suffix.
      suffix = ` ${params.units}`;
    } else {
      value = convertModule.convert(value, params.units).to(params.convertTo);
    }
  }

  value = value.toFixed(params.decimals || 0);

  value = value.toLocaleString(params.locale || 'en-GB');

  return `${params.prefix || ''}${value}${suffix || ''}`;
}
