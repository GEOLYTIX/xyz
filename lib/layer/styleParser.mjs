export default layer => {

  if (layer.style?.theme) {
    parseTheme(layer.style.theme)
  }

  if (layer.style?.themes) {

    Object.keys(layer.style.themes).forEach(key => {

      parseTheme(layer.style.themes[key])
    })
  }

  function parseTheme(theme) {

    if (theme?.cat) {

      Object.keys(theme?.cat).forEach(key => {
  
        const cat = theme?.cat[key]
  
        cat.style ??= {...cat}
  
        cat.style = {
          ...structuredClone(layer.style.default),
          ...cat.style
        }
      })
    }
  
    if (Array.isArray(theme?.cat_arr)) {
  
      for (const cat of theme.cat_arr) {
  
        cat.style ??= {...cat}
  
        cat.style = {
          ...structuredClone(layer.style.default),
          ...cat.style
        }
  
        delete cat.style.label
      }
    }
  }
}