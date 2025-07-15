/**
### /layer/styleParser

The styleParser module exports the styleParser method as default which is intended to check the consistency of layer styles and issue console warnings in regards to backwards compatibility.

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

const iconKeys = new Set(['anchor', 'scale', 'url', 'svg', 'type']);

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
  'highlightScale',
  ...iconKeys,
]);

/**
@function styleParser

@description
The styleParser method parses and validates the mapp.style object and its properties.

The styleParser method checks the highlight features style and calls the warnings method.

The clusterStyle method is called to ensure that cluster layer have a cluster style.

Individual themes in the themes object are parsed and a theme is assigned to the

The parseTheme method is called for the layer.style.theme and each of the layer.style.themes.

A lookup will be attempted if the theme property is a string. Otherwise the first theme object property from the themes object is assigned as theme if undefined.

A lookup will be attempted if the hover property is a string. Otherwise the first hover object property from the hovers object is assigned as hover if undefined.

A lookup will be attempted if the label property is a string. Otherwise the first label object property from the labels object is assigned as label if undefined.

@param {layer} layer A json layer object.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {feature-style} [style.highlight] The feature style applied to features by the highlight interaction.
@property {object} [style.theme] The current theme applied to the feature styling.
@property {array} [style.themes] An array of theme objects available to be applied as the layer.style.theme.
*/
export default function styleParser(layer) {
  layer.style ??= {};

  if (typeof layer.style.highlight === 'object') {
    // Ensure that highlight zIndex is always on top.
    layer.style.highlight.zIndex ??= Infinity;
    layer.style.highlight.highlightScale ??= layer.style.highlight.scale;
    delete layer.style.highlight.scale;
  }

  warnings(layer);

  clusterChecks(layer);

  parseTheme(layer.style.theme, layer);

  if (layer.style?.themes) {
    Object.keys(layer.style.themes).forEach((key) => {
      // A theme will be represented by a string if the theme has already been parsed as layer.style.theme{}
      if (layer.style.themes[key] === key) {
        layer.style.themes[key] = layer.style.theme;
        return;
      }

      // required for the lookup of self referenced objects
      layer.style.themes[key].key = key;

      if (layer.style.themes[key].skip) {
        delete layer.style.themes[key];
        return;
      }

      // required for the lookup of self referenced objects
      layer.style.themes[key].key = key;

      // assign key as fallback title
      layer.style.themes[key].title ??= key;

      parseTheme(layer.style.themes[key], layer);
    });

    // Assign the first key from themes object as theme string property if undefined.
    layer.style.theme ??= Object.keys(layer.style.themes)[0];

    // Assign theme property from themes object if string.
    if (typeof layer.style.theme === 'string') {
      layer.style.theme = layer.style.themes[layer.style.theme];
    }
  }

  handleHovers(layer);

  // Handle multiple labels in layer style.
  if (layer.style?.labels) {
    Object.keys(layer.style.labels).forEach((key) => {
      // required for the lookup of self referenced objects
      layer.style.labels[key].key = key;

      // assign key as fallback title
      layer.style.labels[key].title ??= key;
    });

    // Assign the first key from labels object as label string property if undefined.
    layer.style.label ??= Object.keys(layer.style.labels)[0];

    // Assign label property from labels object if string.
    if (typeof layer.style.label === 'string') {
      layer.style.label = layer.style.labels[layer.style.label];
    }
  }

  if (layer.style?.icon_scaling?.fields) {
    Object.keys(layer.style.icon_scaling.fields).forEach((key) => {
      // required for the lookup of self referenced objects
      layer.style.icon_scaling.fields[key].key = key;

      // assign key as fallback title
      layer.style.icon_scaling.fields[key].title ??= key;
    });

    // Assign the first key from fields object as field string property if undefined.
    layer.style.icon_scaling.field ??= Object.values(
      layer.style.icon_scaling.fields,
    )[0]?.field;
  }
}

/**
@function warnings

@description
The warnings method parses the layer style configuration and warns on legacy configurations while trying to rectify these issues.

The method ensures that the layer-style object has a default feature-style. The default feature-style must have an icon if the layer is a cluster layer.

The default is a feature-style which must not contain a style object property.

The icon object of the default style is checked.

The layer.hover legacy configuration is checked.

The layer.style.zIndex legacy configuration is checked.

The layer.icon_scaling legacy configuartion is checked.

@param {layer} layer A json layer object.
@property {Object} [layer.cluster] Cluster configuration for a point layer.
@property {Object} [layer.hover] Legacy configuration for style.hover.
@property {Object} [layer.icon_scaling] Legacy configuration for style.icon_scaling.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {feature-style} style.default Default feature style.
@property {integer} [style.zIndex] Legacy configuration for layer.zIndex.
*/
function warnings(layer) {
  if (!layer.style.default) {
    console.warn(
      `Layer: ${layer.key} has no implicit default style. Please add style.default.`,
    );

    // Assign default style for vector layer.
    // Non cluster layer do not have a default icon style
    layer.style.default = layer.cluster
      ? {
          icon: {
            type: 'dot',
          },
        }
      : {
          fillColor: '#fff9',
          strokeColor: '#333',
        };
  }

  // The default is a feature-style which must not contain a style object property.
  if (layer.style.default.style) {
    console.warn(
      `Layer: ${layer.key} has a style object within the default style configuration.`,
    );

    layer.style.default = layer.style.default.style;

    delete layer.style.default.style;
  }

  iconObject(layer.style.default);

  // Handle legacy layer.hover configuration.
  if (layer.hover) {
    console.warn(
      `Layer: ${layer.key}, layer.hover{} should be defined within layer.style{}.`,
    );
    layer.style.hover = layer.hover;
    delete layer.hover;
  }

  // Handle legacy layer.style.zIndex configuration.
  if (layer.style.zIndex) {
    console.warn(
      `Layer: ${layer.key}, layer.style.zIndex has been deprecated. Use layer.zIndex instead.`,
    );
  }

  // Handle legacy layer.icon_scaling configuration.
  if (layer.icon_scaling) {
    console.warn(
      `Layer: ${layer.key}, layer.icon_scaling has been assigned to layer.style.icon_scaling`,
    );

    layer.style.icon_scaling ??= layer.icon_scaling;
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
  if (!layer.cluster) return;

  if (!layer.style.default.icon) {
    layer.style.default = {
      icon: {
        type: 'dot',
      },
    };

    console.warn(
      `Cluster Layer: ${layer.key} has no default icon. 'Dot' will be assigned.`,
    );
  }

  // Cluster layer must not have stroke or fill styles.
  Object.keys(layer.style.default)
    .filter((key) => !['icon', 'scale'].includes(key))
    .forEach((key) => {
      console.warn(
        `Cluster Layer: ${layer.key}; ${key} key removed from default style.`,
      );

      delete layer.style.default[key];
    });

  // Define default style cluster icon
  layer.style.cluster = {
    clusterScale: 1,
    icon: {
      type: 'dot',
    },
    ...layer.style.cluster,
  };

  if (layer.style.cluster.zoomInScale) {
    layer.style.zoomInScale = layer.style.cluster.zoomInScale;

    delete layer.style.cluster.zoomInScale;
  }

  if (layer.style.cluster.zoomOutScale) {
    layer.style.zoomOutScale = layer.style.cluster.zoomOutScale;

    delete layer.style.cluster.zoomOutScale;
  }

  if (Array.isArray(layer.style.cluster.icon)) {
    layer.style.cluster.icon.forEach(iconUrlSVG);
  } else {
    iconUrlSVG(layer.style.cluster.icon);
  }
}

/**
@function iconUrlSVG

@description
The method assigns the url icon property from the svg icon property. The svg definition will be removed. Previously it was possible to define the URL as url or svg property. This required multiple checks. It is easier to just use the Openlayers url property.

@param {Object} icon A JSON style icon configuration.
@property {string} icon.url The url for the icon to be rendered on a point feature.
*/
function iconUrlSVG(icon) {
  icon.url ??= icon.svg;
  delete icon.svg;
}

/**
@function parseTheme

@description
The parseTheme method checks whether a theme and it's categories have consistent style objects.

@param {Object} theme A json theme object.
@param {layer} layer A json layer object.
@property {string} theme.type The type of the theme.
@property {array} theme.categories An ordered array of theme categories.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {feature-style} style.default Default feature style.
*/
function parseTheme(theme, layer) {
  if (typeof theme !== 'object') return;

  if (typeof theme.style === 'object') {
    // Assign the default style to the theme.style
    theme.style = {
      ...structuredClone(layer.style.default),
      ...theme.style,
    };

    iconObject(theme.style);
  }

  if (typeof theme.cat === 'object') {
    theme.categories = Object.keys(theme.cat).map((key) => {
      const cat = theme.cat[key];

      cat.label ??= key;
      cat.value ??= key;

      return cat;
    });

    delete theme.cat;
  }

  if (Array.isArray(theme.cat_arr)) {
    theme.categories = theme.cat_arr;

    delete theme.cat_arr;
  }

  graduatedTheme(theme);

  theme.categories?.forEach((cat) => {
    cat.label ??= cat.value;

    if (cat.icon) {
      cat.style = {
        icon: cat.icon,
      };

      delete cat.icon;
    }

    catStyle(cat, layer);
  });

  // Check validity of categorized theme with multiple fields.
  if (theme.type === 'categorized' && Array.isArray(theme.fields)) {
    theme.categories.forEach((cat) => {
      if (!theme.fields.includes(cat.field)) {
        console.warn(
          `Layer: ${layer.key}; Cat ${cat.label} missed valid field.`,
        );
      }

      // Multiple field cat theme style must be icon.
      if (!cat.style.icon) {
        console.warn(
          `Layer: ${layer.key}; Cat ${cat.label} has invalid icon style.`,
        );

        cat.style.icon = { type: 'dot' };
      }
    });
  }
}

/**
@function graduatedTheme

@description
The checks the order of theme categories according to their value. The method will shortcircuit if the type of the theme is not graduated.

@param {Object} theme A json theme object.
@param {layer} layer A json layer object.
@property {string} theme.type The type of the theme.
@property {string} theme.graduated_breaks The value order of categories, eg. 'less_than' or 'greater_than'
@property {array} theme.categories An ordered array of theme categories.
*/
function graduatedTheme(theme) {
  if (theme.type !== 'graduated') return;

  if (!['less_than', 'greater_than'].includes(theme.graduated_breaks)) {
    theme.graduated_breaks = 'less_than';
  }

  theme.categories.forEach((cat) => (cat.value = Number(cat.value)));

  if (theme.graduated_breaks === 'less_than') {
    theme.categories.sort((a, b) => (a.value > b.value ? 0 : -1));
  } else {
    theme.categories.sort((a, b) => (a.value > b.value ? -1 : 0));
  }
}

/**
@function catStyle

@description
The catStyle method parses the style object of a theme category object.

Category themes are attempted to be merged with the default style if possible.

@param {object} cat The category object.
@param {layer} layer The layer reference for the style/theme/cat object.
*/
function catStyle(cat, layer) {
  cat.style ??= {};

  // Style arrays are assumed to be valid.
  if (Array.isArray(cat.style)) return;

  // Ensure that the icon object is within a style object.
  if (cat.icon) {
    cat.style = {
      icon: cat.icon,
    };
    delete cat.icon;
  }

  const defaultStyle = structuredClone(layer.style.default);

  if (cat.style.icon) {
    // Do not merge default style into icon array.
    if (Array.isArray(cat.style.icon)) {
      cat.style.icon.forEach(iconUrlSVG);
      return;
    }

    // Do not merge default style into icon with type definition.
    if (cat.style.icon.type) return;

    iconUrlSVG(cat.style.icon);

    // Do not merge default style into svg [type] icons.
    if (cat.style.icon.url) return;

    if (defaultStyle.icon && !Array.isArray(defaultStyle.icon)) {
      cat.style.icon = {
        ...defaultStyle.icon,
        ...cat.style.icon,
      };
    }

    return;
  }

  // Create a mergeStyle from valid styleKeys
  const mergeStyle = {};

  Object.keys(defaultStyle)
    .filter((key) => styleKeys.has(key))
    .forEach((key) => (mergeStyle[key] = defaultStyle[key]));

  cat.style = {
    ...mergeStyle,
    ...cat.style,
  };

  Object.keys(cat)
    .filter((key) => styleKeys.has(key))
    .forEach((key) => {
      cat.style[key] = cat[key];
      delete cat[key];
    });

  iconObject(cat.style);

  // Assign default icon if no cat style icon could be created.
  if (!cat.style.icon && defaultStyle.icon) {
    console.warn(
      `Layer:${layer.key}, Failed to evaluate icon: ${JSON.stringify(
        cat,
      )}. Default icon will be assigned.`,
    );

    cat.style.icon = defaultStyle.icon;
  }
}

/**
@function iconObject

@description
The iconObject method parses a feature-style object without an icon object to check whether there are icon object specific properties defined in the style object. An icon object will be created from the icon specific properties with these properties being removed from the style object itself.

@param {feature-style} style
@property {object} [style.icon] The style object already has an icon definition.
*/
function iconObject(style) {
  if (Array.isArray(style.icon)) {
    style.icon.forEach(iconUrlSVG);

    // Turns array of 1 into icon object
    if (style.icon.length === 1) {
      style.icon = style.icon[0];
    }
    return;
  }

  // The style object already has an icon object.
  if (!style.icon) {
    // Create icon object if style has an iconKey property ['anchor', 'scale', 'url', 'svg', 'type']
    Object.keys(style)
      .filter((key) => iconKeys.has(key))
      .forEach((key) => {
        style.icon ??= {};
        style.icon[key] = style[key];
        delete style[key];
      });
  }

  if (!style.icon) return;

  iconUrlSVG(style.icon);
}

/**
@description
The handleHovers method parses the layer's hover/s properties.
It provides fallback values to the hover/s key, title properties as well as assign a featureHover method if not provided.
It also assigns the first hover string from the hovers if undefined.
@param {layer} layer The layer reference for the style/hover/s object.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {string} [style.hover] The current hover applied to the feature styling.
@property {array} [style.hovers] An array of hover objects available to be applied as the layer.style.hover.
 */
function handleHovers(layer) {
  // Handle multiple hovers in layer style.
  if (layer.style?.hovers) {
    Object.keys(layer.style.hovers).forEach((key) => {
      // required for the lookup of self referenced objects
      layer.style.hovers[key].key = key;

      // assign key as fallback title
      layer.style.hovers[key].title ??= key;
    });

    // Assign the first key from hovers object as hover string property if undefined.
    layer.style.hover ??= Object.keys(layer.style.hovers)[0];

    // Assign hover property from hovers object if string.
    if (typeof layer.style.hover === 'string') {
      layer.style.hover = layer.style.hovers[layer.style.hover];
    }
  }

  // Set default featureHover method if not provided.
  if (layer.style?.hover) {
    layer.style.hover.method ??= mapp.layer.featureHover;
  }
}
