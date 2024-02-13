export default layer => {

  if (layer.style.theme?.cat) {

    Object.keys(layer.style.theme?.cat).forEach(key => {

      const cat = layer.style.theme?.cat[key]

      cat.style ??= {...cat}

      cat.style = {
        ...structuredClone(layer.style.default),
        ...cat.style
      }
    })
  }

  if (Array.isArray(layer.style.theme?.cat_arr)) {

    for (const cat of layer.style.theme.cat_arr) {

      cat.style ??= {...cat}

      cat.style = {
        ...structuredClone(layer.style.default),
        ...cat.style
      }

      delete cat.style.label
    }
  }
}