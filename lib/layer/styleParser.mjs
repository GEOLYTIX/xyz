/**
### mapp.layer.styleParser()

The `styleParser` module method is responsible for parsing and validating the layer.style object for assigning feature styles.

The main tasks performed by the `styleParser` module include:

1. Assigning default styles:
  - It assigns a default highlight style to the layer if not explicitly provided.
  - It sets the default `zIndex` value for the highlight style to `Infinity`.
  - It assigns an empty object to `layer.style` if it doesn't exist.
  - It assigns an empty object to `layer.style.default` if it doesn't exist.

2. Parsing theme styles:
  - If `layer.style.theme` exists, it calls the `parseTheme` function to process the theme style configuration.
  - If `layer.style.themes` exists, it iterates over each theme and calls the `parseTheme` function for each theme.

3. Handling multiple themes, hovers, and labels:
  - If multiple themes are defined in `layer.style.themes`, it selects the appropriate theme based on the `layer.style.theme` value or the first theme in the object.
  - If multiple hovers are defined in `layer.style.hovers`, it selects the appropriate hover style based on the `layer.style.hover` value or the first hover style in the object.
  - If multiple labels are defined in `layer.style.labels`, it selects the appropriate label style based on the `layer.style.label` value or the first label style in the object.

4. Handling warnings and deprecation notices:
  - It calls the `warnings` function to handle warnings and deprecation notices related to the layer style configuration.
  - It checks for deprecated properties and provides appropriate warnings or fallback values.

5. Processing style objects:
  - It calls the `styleObject` function to process individual style objects within themes or categories.
  - It merges the category style with the default style and handles icon styles separately.

6. Processing icon style objects:
  - It calls the `iconObject` function to process icon style objects within the layer style.
  - It moves icon-related properties into a separate `icon` object within the style.

Overall, the `styleParser` module ensures that the layer style configuration is properly structured, applies default styles where necessary, handles multiple themes, hovers, and labels, and processes individual style objects and icon styles. It helps to maintain a consistent and valid style configuration for the layer in the mapping application.

@module /layer/styleParser
 */

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

/**
Parses and validates the style configuration of a layer.
@function styleParser
@param {Object} layer - The layer object.
@param {Object} layer.style - The style configuration of the layer.
@param {Object} [layer.style.default] - The default style for features.
@param {Object} [layer.style.highlight] - The style for highlighted features.
@param {Object} [layer.style.theme] - The theme style configuration.
@param {Object} [layer.style.themes] - Multiple theme style configurations.
@param {Object} [layer.style.hover] - The hover style configuration.
@param {Object} [layer.style.hovers] - Multiple hover style configurations.
@param {Object} [layer.style.label] - The label style configuration.
@param {Object} [layer.style.labels] - Multiple label style configurations.
@param {Object} [layer.cluster] - The cluster configuration of the layer.
@returns {void}
 */
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
    parseTheme(layer.style.theme, layer)
  }

  if (layer.style?.themes) {
    Object.keys(layer.style.themes).forEach(key => {
      parseTheme(layer.style.themes[key], layer)
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

  /**
  Handles warnings and deprecation notices for the layer style configuration.
  @function warnings
  @param {Object} layer - The layer object.
  @returns {void}
   */
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

    iconObject(layer.style.default)

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

  /**
   Parses a theme style configuration.
   @function parseTheme
   @param {Object} theme - The theme style configuration.
   @param {Object} layer - The layer object.
   @returns {void}
   */
  function parseTheme(theme, layer) {

    if (typeof theme.cat === 'object') {

      theme.categories = Object.keys(theme.cat).map(key => {

        const cat = theme.cat[key]
        
        cat.label ??= key
        cat.value ??= key

        return cat
      })

      delete theme.cat
    }

    if (Array.isArray(theme.cat_arr)) {

      theme.categories = theme.cat_arr

      delete theme.cat_arr
    }

    if (Array.isArray(theme.categories)) {

      if (theme.type === 'graduated' && !theme.graduated_breaks) {

        console.warn(`No chk direction for graduated theme on layer: ${layer.key}; field: ${theme.field}. Less than is assumed.`)
        theme.graduated_breaks = 'less_than'
      }

      if (theme.type === 'graduated' && theme.graduated_breaks === 'greater_than') {

        // The cat array must be reversed when checking whether a value is supposed to be greater.
        theme.categories.reverse()
      }

      theme.categories.forEach(cat => {

        cat.label ??= cat.value

        styleObject(cat, structuredClone(layer.style.default))       
      })
    }
  }

  /**
   Processes a style object and merges it with the default style.
   @function styleObject
   @param {Object} cat - The category style object.
   @param {Object} defaultStyle - The default style object.
   @returns {void}
  */
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

      if (Array.isArray(cat.style.icon)) return;

      if (defaultStyle.icon && !Array.isArray(defaultStyle.icon)) {

        Object.assign(cat.style.icon, defaultStyle.icon)
      }
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

    iconObject(cat.style)
  }

  /**
  Processes an icon style object.
  @function iconObject
  @param {Object} style - The style object.
  @returns {void}
  */
  function iconObject(style) {

    // Assume that the style object is an icon.
    if (Object.keys(style).some(key => iconKeys.has(key))) {

      Object.keys(style)
        .forEach(key => {
          style.icon ??= {};
          style.icon[key] = style[key]
          delete style[key]
        })
    }
  }
}