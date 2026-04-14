/**
### /utils/olStyle

The olStyle utility module exports the default olStyle method.

@module /utils/olStyle
*/

/**
@global
@typedef {Object} feature-style
A JSON mapp-style object.
@property {string} [svg] The SVG source for the icon.
@property {string} [type] The type of the icon.
@property {Array|Object} [icon] The icon configuration or an array of icon configurations.
@property {number} [width] The width of the icon or symbol.
@property {number} [height] The height of the icon or symbol.
@property {string} [strokeColor] The stroke color of the line symbol.
@property {number} [strokeWidth] The stroke width of the line symbol.
@property {string} [fillColor] The fill color of the polygon symbol.
@property {number} [fillOpacity] The fill opacity of the polygon symbol.
@property {Array} [lineDash] An Array of numbers that specify distances to alternately draw a line and a gap, eg: [5, 4].

*/

/**
@function olStyle

@description
The olStyle method takes a mapp-style JSON representation to create an Openlayers style object for rendering Openlayers features in the Openlayers mapview.Map.

@param {feature-style} style A JSON mapp-style object.

@returns {Object} An Openlayers feature style object.
*/
export default function olStyle(style, feature) {
  if (!style) return null;

  // Array for OL Style objects.
  const Styles = [];

  // The style object must always be processed as an array.
  style = Array.isArray(style) ? style : [style];

  // Iterate through style array.
  style.forEach((style) => {
    // Only process icon for features if they are point geometries.
    if (style.icon) {
      // Iterate through icon style array.
      if (Array.isArray(style.icon)) {
        style.icon.forEach((icon) => iconStyle(Styles, style, icon, feature));
      } else {
        iconStyle(Styles, style, style.icon, feature);
      }
    }

    if (style.fillColor || style.strokeColor) {
      // Create OL fill.
      const fill =
        style.fillColor &&
        new ol.style.Fill({
          color: mapp.utils.hexa(style.fillColor, style.fillOpacity),
        });

      // Create OL stroke.
      const stroke =
        style.strokeColor &&
        new ol.style.Stroke({
          color: mapp.utils.hexa(style.strokeColor, style.strokeOpacity),
          width: parseFloat(style.strokeWidth || 1),
          lineDash: style.lineDash,
        });

      // Push OL vector Style into Styles array.
      Styles.push(new ol.style.Style({ fill, stroke, zIndex: style.zIndex }));
    }

    // Create label style if label text is not undefined.
    if (typeof style.label?.text !== 'undefined') {
      const text = new ol.style.Text({
        fill: new ol.style.Fill({
          color: style.label.fillColor || '#000',
        }),
        font: style.label.font || '12px sans-serif',
        offsetX: style.label.offsetX,
        offsetY: style.label.offsetY,
        overflow: style.label.overflow,
        stroke:
          style.label.strokeColor &&
          new ol.style.Stroke({
            color: style.label.strokeColor,
            width: style.label.strokeWidth || 1,
          }),
        text: String(style.label.text),
      });

      // Push OL text Style into Styles array.
      Styles.push(new ol.style.Style({ text, zIndex: style.zIndex }));
    }
  });

  // Set Styles object to cache style.
  feature?.set?.('Styles', Styles, true);

  return Styles;
}

/**
@function iconStyle

@description
The iconStyle method calculates the scale for the Openlayers Style Icon.

On Openlayers Style Icon requires an URL. A `data:image` URL will be created from the svgSymbols module methods if not explicit.

@param {array} Styles An array of Openlayers style objects.
@param {feature-style} style A JSON mapp-style object.
@param {object} icon An array of Openlayers style objects.
@param {object} feature The Openlayers feature to style with an icon.
*/
function iconStyle(Styles, style, icon, feature) {
  // Calculate scale for icon render.
  let scale = icon.scale || 1;
  scale *= style.scale || 1;
  scale *= style.clusterScale || 1;
  scale *= style.fieldScale || 1;
  scale *= style.zoomInScale || 1;
  scale *= style.zoomOutScale || 1;
  scale *= style.highlightScale || 1;

  // Create icon url from svgSymbols method if not defined as url or svg source.
  icon.url ??=
    icon.svg || mapp.utils.svgSymbols[icon.type || 'dot'](icon, feature);

  if (!icon.url) return;

  // Push OL icon Style into Styles array.
  Styles.push(
    new ol.style.Style({
      image: new ol.style.Icon({
        anchor: icon.anchor || [0.5, 0.5],
        crossOrigin: 'anonymous',
        scale: scale,
        src: icon.url,
      }),
      zIndex: style.zIndex,
    }),
  );
}
