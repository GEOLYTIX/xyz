const iconKeys = new Set([
  'anchor',
  'scale',
  'url',
  'svg',
  'type'])

const styleKeys = new Set([
  'zIndex',
  'strokeColor',
  'strokeWidth',
  'strokeOpacity',
  'fillOpacity',
  'fillColor',
  'clusterScale',
  'zoomInScale',
  'zoomOutScale',
  'highlightScale']).union(iconKeys)

export default layer => {

  // Assign a default highlight style and ensure that zIndex is infinity if not implicit.
  layer.style.highlight ??= {}
  layer.style.highlight.zIndex ??= Infinity
  layer.style.highlight.highlightScale = layer.style.highlight.scale
  delete layer.style.highlight.scale

  layer.style ??= {}

  warnings(layer)

  layer.style.default ??= {}

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

    if (!layer.style.default) {

      layer.style.default = layer.cluster
        ? {
          icon: {
            type: 'dot',
            fillColor: '#fff',
          }
        }
        : {
          strokeColor: '#333',
          fillColor: '#fff9',
        }

      console.warn(`Layer: ${layer.key} has no implicit default style. Please add style.default.`)
    }

    if (layer.cluster) {

      // Define default style cluster icon
      layer.style.cluster ??= {
        clusterScale: 1,
        icon: {
          type: "dot"
        }
      }

      if (!layer.style.cluster.icon) {

        styleObject(layer.style.cluster)

        layer.style.cluster = { ...layer.style.cluster.style }

        delete layer.style.cluster.style

        console.log(layer.style.cluster)
      }
    }

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

    if (theme.cat) {

      Object.keys(theme.cat).forEach(key => {

        //theme.cat.label ??= key
        styleObject(theme.cat[key], structuredClone(layer.style.default))
      })
    }

    if (theme.cat_arr) {

      for (const cat of theme.cat_arr) {

        styleObject(cat, structuredClone(layer.style.default))
      }
    }
  }

  function styleObject(cat, defaultStyle) {

    // Style arrays are assumed to be valid.
    if (Array.isArray(cat.style)) return;

    if (cat.icon) {
      cat.style = {
        icon: cat.icon
      }
      delete cat.icon
    }

    if (cat.style?.icon) {
      return;
    }

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

    // Assume that the style object is an icon.
    if (Object.keys(cat.style).some(key => iconKeys.has(key))) {

      Object.keys(cat.style)
        .forEach(key => {
          cat.style.icon ??= {};
          cat.style.icon[key] = cat.style[key]
          delete cat.style[key]
        })
    }
  }
}