export function reset(layer) {

  // Create featureFields object if nullish.
  layer.featureFields ??= {}

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

  layer.featureFields[theme.field].jenks =
    mapp.utils.stats.jenks(layer.featureFields[theme.field].values, n)

  theme.cat_arr.forEach((cat, i) => {

    cat.value = layer.featureFields[theme.field].jenks[i]    
  })
}

function count(layer) {

  let theme = layer.style.theme

  layer.featureFields[theme.field].values.forEach(val => {

    layer.featureFields[theme.field][val] ??= 0
    layer.featureFields[theme.field][val]++
  })
}