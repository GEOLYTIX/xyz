export function reset(layer) {

  // Create featureFields object if nullish.
  layer.featureFields ??= {}

  if (!layer.style.theme?.field) return;

  layer.featureFields[layer.style.theme.field] = {
    values: []
  };
}

export function process(layer) {

  if (Object.hasOwn(distribution, layer.style?.theme?.distribution)) {

    distribution[layer.style.theme.distribution](layer)

    layer.style.legend.replaceWith(mapp.ui.layers.legends[layer.style.theme.type](layer))
  }
}

export const distribution = {
  jenks,
  count
}

function jenks(layer) {

  let theme = layer.style.theme

  let n = layer.featureFields[theme.field].values.length < theme.cat_arr.length ?
    layer.featureFields[theme.field].values.length : theme.cat_arr.length;

  // parse array values as float
  layer.featureFields[theme.field].values = layer.featureFields[theme.field].values.map(parseFloat)

  layer.featureFields[theme.field].jenks =
    mapp.utils.stats.jenks(layer.featureFields[theme.field].values, n)

  let val

  theme.cat_arr.forEach((cat, i) => {

    val = val === layer.featureFields[theme.field].jenks[i] ? undefined : layer.featureFields[theme.field].jenks[i]

    cat.value = val
  })
}

function count(layer) {

  let theme = layer.style.theme

  layer.featureFields[theme.field].values.forEach(val => {

    layer.featureFields[theme.field][val] ??= 0
    layer.featureFields[theme.field][val]++
  })
}