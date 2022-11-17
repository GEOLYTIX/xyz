let promise, convert;

async function moduleImport() {

  if (!promise) promise = new Promise(async resolve => {

    import('https://cdn.skypack.dev/convert@4')
      .then(mod => resolve(convert = mod.convert))

  })

  await promise
}

export default async (value, params) => {

  await moduleImport()

  value = parseFloat(value)

  if (params.units && params.convertTo) {

    value = convert(value, params.units).to(params.convertTo);
  }

  value = value.toFixed(params.decimals || 0)

  value = value.toLocaleString(params.locale || 'en-GB')

  return `${params.prefix || ''}${value}${params.suffix || ''}`
}