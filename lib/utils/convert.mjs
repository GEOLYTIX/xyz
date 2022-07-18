import convert from 'https://cdn.skypack.dev/convert@4';

export default (value, params) => {

  value = parseFloat(value)

  if (params.units && params.convertTo) {

    value = convert(value, params.units).to(params.convertTo);
  }

  value = value.toFixed(params.decimals || 0)

  value = value.toLocaleString(params.locale || 'en-GB')

  return `${params.prefix || ''}${value}${params.suffix || ''}`
}
