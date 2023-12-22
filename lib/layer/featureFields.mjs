export function reset(layer) {

  // Create featureFields object if nullish.
  layer.featureFields ??= {}

  if (layer.style.theme?.legend?.dynamic) {
    Object.values(layer.style.theme.cat).forEach(cat => {
      if (cat.node.querySelector('.disabled')) return;
      cat.node.style.display = 'none'
    })
  }

  if (layer.style?.theme?.distribution) {
    
    layer.featureFields[layer.style.theme.field] = {
      values: []
    };
  }
}

export function process(layer) {

  if (Object.hasOwn(distribution, layer.style?.theme?.distribution)) {

    distribution[layer.style.theme.distribution](layer)
  }
}

export const distribution = {
  jenks
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

  layer.style.legend.replaceWith(mapp.ui.layers.legends[theme.type](layer))
}