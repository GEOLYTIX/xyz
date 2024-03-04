const iconKeys = new Set([
  'anchor',
  'scale',
  'clusterScale',
  'zoomInScale',
  'zoomOutScale',
  'highlightScale',
  'url',
  'svg',
  'type',
  'fillColor'])

const styleKeys = new Set([
  'icon',
  'zIndex',
  'strokeColor',
  'strokeWidth',
  'strokeOpacity',
  'fillOpacity']).union(iconKeys)

export default layer => {

  layer.style ??= {}

  layer.style.default ??= {
    strokeColor: '#333',
    fillColor: '#fff9',
    icon: {
      type: 'dot'
    }
  }

  warnings(layer)

  if (layer.style?.theme) {
    parseTheme(layer.style.theme)
  }

  if (layer.style?.themes) {
    Object.keys(layer.style.themes).forEach(key => {
      parseTheme(layer.style.themes[key])
    })
  }

  // Handle multiple themes in layer style.
  if (layer.style?.themes) {
    Object.keys(layer.style.themes).forEach(key => {
      layer.style.themes[key].title ??= key;
      if (layer.style.themes[key].skip) delete layer.style.themes[key];
    });
    layer.style.theme = typeof layer.style.theme === 'object'
      ? layer.style.theme
      : layer.style.themes[layer.style.theme || Object.keys(layer.style.themes)[0]];
  }

  // Handle multiple hovers in layer style.
  if (layer.style?.hovers) {
    layer.style.hover = typeof layer.style.hover === 'object' ? layer.style.hover : layer.style.hovers[layer.style.hover || Object.keys(layer.style.hovers)[0]];
  }

  // Set default featureHover method if not provided.
  if (layer.style?.hover) {
    layer.style.hover.method ??= mapp.layer.featureHover;
  }

  // Handle multiple labels in layer style.
  if (layer.style?.labels) {
    layer.style.label = typeof layer.style.label === 'object' ? layer.style.label : layer.style.labels[layer.style.label || Object.keys(layer.style.labels)[0]];
  }

  function warnings(layer) {

    // Handle deprecated layer.hover configuration.
    if (layer.hover) {
      console.warn(`Layer: ${layer.key}, layer.hover{} should be defined within layer.style{}.`);
      layer.style.hover = layer.hover;
      delete layer.hover;
    }

    // Handle deprecated layer.style.hover and layer.style.hovers.
    if (layer.style?.hovers && layer.style?.hover) {
      console.warn(`Layer: ${layer.key}, cannot use both layer.style.hover and layer.style.hovers. Layer.style.hover has been deleted.`);
      delete layer.style.hover;
    }

    // Handle deprecated layer.style.label and layer.style.labels.
    if (layer.style?.labels && layer.style?.label) {
      console.warn(`Layer: ${layer.key}, cannot use both layer.style.label and layer.style.labels. Layer.style.label has been deleted.`);
      delete layer.style.label;
    }
  }

  function parseTheme(theme) {

    if (theme?.cat) {

      Object.keys(theme?.cat).forEach(key => {

        styleObject(theme?.cat[key], structuredClone(layer.style.default))
      })
    }

    if (Array.isArray(theme?.cat_arr)) {

      for (const cat of theme.cat_arr) {

        styleObject(cat, structuredClone(layer.style.default))
      }
    }
  }

  function styleObject(cat, defaultStyle) {

    // Style arrays are assumed to be valid.
    if (Array.isArray(cat.style)) return;

    cat.style = {
      ...defaultStyle,
      ...cat.style,
    }

    Object.keys(cat)
      .filter(key => styleKeys.has(key))
      .forEach(key => {
        cat.style[key] = cat[key]
        delete cat[key]
      })

    // Style icon arrays are assumed to be valid.
    if (Array.isArray(cat.style.icon)) return;

    Object.keys(cat.style)
      .filter(key => iconKeys.has(key))
      .forEach(key => {
        cat.style.icon ??= {}
        cat.style.icon[key] = cat.style[key]
      })

  }
}