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

/**
@global
@typedef {Object} layer-style
@property {Boolean} [cache] The feature style should be retrieved from the feature 'Styles' property.
@property {object} theme The current theme to be rendered.
@property {feature-style} [default] The default style for features.
@property {feature-style} [highlight] The style for highlighted features.
@property {Object} [theme] The theme style configuration.
@property {Object} [themes] Multiple theme style configurations.
@property {Object} [hover] The hover style configuration.
@property {Object} [hovers] Multiple hover style configurations.
@property {Object} [label] The label style configuration.
@property {Object} [labels] Multiple label style configurations.
@property {numeric} [zoomInScale] Icon scale is multiplied with mapview zoom level.
@property {numeric} [zoomOutScale] Icon scale is divided by mapview zoom level.
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
  'highlightScale', ...iconKeys])

/**
@function styleParser

@description
The styleParser method parses and validates the mapp.style object and its properties.

@param {layer} layer A json layer object.
@property {layer-style} layer.style The mapp-layer style configuration.
*/
export default function styleParser(layer) {

  layer.style ??= {}

  if (typeof layer.style.highlight === 'object') {

    // Ensure that highlight zIndex is always on top.
    layer.style.highlight.zIndex ??= Infinity
    layer.style.highlight.highlightScale ??= layer.style.highlight.scale
    delete layer.style.highlight.scale
  }

  warnings(layer)

  clusterChecks(layer)

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

  function warnings(layer) {

    if (!layer.style.default) {

      console.warn(`Layer: ${layer.key} has no implicit default style. Please add style.default.`)

      // Assign default style for vector layer.
      // Non cluster layer do not have a default icon style
      layer.style.default = layer.cluster
        ? {
          icon: {
            type: 'dot'
          }
        } : {
          strokeColor: '#333',
          fillColor: '#fff9',
        }
    }

    if (layer.style.default.style) {

      console.warn(`Layer: ${layer.key} has a style object within the default style configuration.`)

      layer.style.default = layer.style.default.style

      delete layer.style.default.style
    }

    iconObject(layer.style.default)

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

    // Handle layer.style.zIndex deprecation.
    if (layer.style.zIndex) {
      console.warn(`Layer: ${layer.key}, layer.style.zIndex has been deprecated. Use layer.zIndex instead.`);
    }

    if (layer.icon_scaling) {

      console.warn(`Layer: ${layer.key}, layer.icon_scaling has been assigned to layer.style.icon_scaling`)

      layer.style.icon_scaling ??= layer.icon_scaling
    }
  }

  function parseTheme(theme, layer) {

    if (typeof theme === 'string') {

      // Attempt theme lookup in themes from string[key]
      theme = layer.style.themes?.[theme]
    }

    if (typeof theme.style === 'object') {

      // Assign the default style to the theme.style
      theme.style = {
        ...structuredClone(layer.style.default),
        ...theme.style
      }
    }

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

    // Check if graduated breaks is not defined, or is not less_than or greater_than.
    if (theme.type === 'graduated') {

      if (!['less_than', 'greater_than'].includes(theme.graduated_breaks)) {

        console.warn(`You must provide a graduated_breaks value of either greater_than or less_than for graduated theme on layer: ${layer.key}; field: ${theme.field}. less_than is assumed.`);

        theme.graduated_breaks ??= 'less_than';
      }

      if (theme.graduated_breaks === 'greater_than') {

        // The cat array must be reversed when checking whether a value is supposed to be greater.
        theme.categories.reverse()
      }
    }

    theme.categories?.forEach(cat => {

      cat.label ??= cat.value

      if (cat.icon) {

        cat.style = {
          icon: cat.icon
        }

        delete cat.icon
      }

      styleObject(cat, structuredClone(layer.style.default))
    })

    // Check validity of categorized theme with multiple fields.
    if (theme.type === 'categorized' && Array.isArray(theme.fields)) {

      theme.categories.forEach(cat => {

        if (!theme.fields.includes(cat.field)) {

          console.warn(`Layer: ${layer.key}; Cat ${cat.label} missed valid field.`)
        }

        // Multiple field cat theme style must be icon.
        if (!cat.style.icon) {

          console.warn(`Layer: ${layer.key}; Cat ${cat.label} has invalid icon style.`)

          cat.style.icon = { type: 'dot' }
        }
      })

    }
  }

  function styleObject(cat, defaultStyle) {

    cat.style ??= {}

    // Style arrays are assumed to be valid.
    if (Array.isArray(cat.style)) return;

    if (cat.icon) {
      cat.style = {
        icon: cat.icon
      }
      delete cat.icon
    }

    if (cat.style.icon) {

      // Do not merge default style into icon array.
      if (Array.isArray(cat.style.icon)) return;

      // Do not merge default style into icon with type definition.
      if (cat.style.icon.type) return;

      // Do not merge default style into svg [type] icons.
      if (cat.style.icon.svg) return;

      if (defaultStyle.icon && !Array.isArray(defaultStyle.icon)) {

        cat.style.icon = {
          ...defaultStyle.icon,
          ...cat.style.icon
        }
      }
      return;

    }

    // Create a mergeStyle from valid styleKeys
    const mergeStyle = {}

    Object.keys(defaultStyle)
      .filter(key => styleKeys.has(key))
      .forEach(key => mergeStyle[key] = defaultStyle[key])

    cat.style = {
      ...mergeStyle,
      ...cat.style,
    }

    Object.keys(cat)
      .filter(key => styleKeys.has(key))
      .forEach(key => {
        cat.style[key] = cat[key]
        delete cat[key]
      })

    iconObject(cat.style)

    // Assign default icon if no cat style icon could be created.
    if (!cat.style.icon && defaultStyle.icon) {

      console.warn(`Layer:${layer.key}, Failed to evaluate icon: ${JSON.stringify(cat)}. Default icon will be assigned.`)

      cat.style.icon = defaultStyle.icon
    }
  }

  function iconObject(style) {

    // The style object already has an icon object.
    if (style.icon) return;

    Object.keys(style)
      .filter(key => iconKeys.has(key))
      .forEach(key => {
        style.icon ??= {};
        style.icon[key] = style[key]
        delete style[key]
      })
  }
}

/**
@function clusterChecks

@description
The clusterChecks styleParser module method checks the style configuration for a cluster layer.

Cluster layer are by defintion point layer and must have style.default.icon to represent point feature geometries.

Other vector geometries can not be displayed in a cluster feature layer. Stroke and fill styles will be removed from the style.default{} configuration.

The style.cluster{} configuration will be spread into a default cluster style object with clusterScale=1.

zoomInScale and zoomOutScale may apply to point features which are not cluster features and are moved to the layer.style.

@param {layer} layer A json layer object.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {Object} layer.cluster Cluster configuration for a point layer.
@property {feature-style} style.default Default feature style.
@property {feature-style} style.cluster Style for cluster feature.
@property {feature-style} style.selected Style for features of selected locations.
*/
function clusterChecks(layer) {

  if (!layer.cluster) return

  if (!layer.style.default.icon) {

    layer.style.default = {
      icon: {
        type: 'dot'
      }
    }

    console.warn(`Cluster Layer: ${layer.key} has no default icon. 'Dot' will be assigned.`)
  }

  // Cluster layer must not have stroke or fill styles.
  Object.keys(layer.style.default)
    .filter(key => !['icon', 'scale'].includes(key))
    .forEach(key => {

      console.warn(`Cluster Layer: ${layer.key}; ${key} key removed from default style.`)

      delete layer.style.default[key]
    })

  // Define default style cluster icon
  layer.style.cluster = {
    clusterScale: 1,
    icon: {
      type: 'dot'
    },
    ...layer.style.cluster
  }

  if (layer.style.cluster.zoomInScale) {

    layer.style.zoomInScale = layer.style.cluster.zoomInScale

    delete layer.style.cluster.zoomInScale
  }

  if (layer.style.cluster.zoomOutScale) {

    layer.style.zoomOutScale = layer.style.cluster.zoomOutScale

    delete layer.style.cluster.zoomOutScale
  }
}
