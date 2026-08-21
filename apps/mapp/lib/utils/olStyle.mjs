/**
### /utils/olStyle

The olStyle utility module exports the default olStyle method.

@requires /utils/svgToBitmap

@module /utils/olStyle
*/

import { bitmapUnavailable, iconBitmap } from './svgToBitmap.mjs';

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
@property {Boolean} [bitmap_icons] Icons should be rendered from rasterized bitmaps.

*/

/**
@function olStyle

@description
The olStyle method takes a mapp-style JSON representation to create an Openlayers style object for rendering Openlayers features in the Openlayers mapview.Map.

@param {feature-style} style A JSON mapp-style object.
@param {Object} [feature] The Openlayers feature to style.

@returns {Object} An Openlayers feature style object.
*/
export default function olStyle(style, feature) {
  if (!style) return null;

  // The fallback flag is assigned by the styleIcon method for the current olStyle call.
  fallbackStyle = false;

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
          width: Number.parseFloat(style.strokeWidth || 1),
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
  // A style with a fallback symbol must not be cached. The cached Styles would outlive the rasterization of the icon variant and the fallback would never be replaced.
  !fallbackStyle && feature?.set?.('Styles', Styles, true);

  return Styles;
}

/**
The memoizedStyleIcons Map holds ol.style.Icon objects for the icon src, anchor, and scale.

An ol.style.Icon is immutable once created and may be shared by any number of features. Sharing the object prevents a new Icon being allocated for every feature on every render.

An Icon created from a bitmap image must not be cloned or recoloured. The Openlayers Icon.clone() and Icon.setColor() methods both pass Icon.getSrc() to a new Icon, and the src of a bitmap backed Icon is the uid of the image object rather than a url.
*/
const memoizedStyleIcons = new Map();

/**
The memoizedFallbacks Map holds the fallback ol.style.Circle for a fill colour.

The fallback is rendered while an icon variant is being rasterized. The Openlayers cache key for a RegularShape is structural, so a fixed radius yields one cache entry per colour regardless of the number of features. The feature scale is deliberately not applied: the fallback is transient and must not multiply the number of cache entries.
*/
const memoizedFallbacks = new Map();

/**
The number of ol.style.Icon objects to memoize.

The scale is part of the key and may be a unique value per feature where a cluster or zoom scale is applied. The memo is bound to prevent unbounded growth. Entries are evicted in insertion order.
*/
const styleIconMemoLimit = 1024;

/**
Set by the styleIcon method where a fallback symbol was returned for the current olStyle call.
*/
let fallbackStyle = false;

/**
The svgSymbols types which have been warned about, so that an invalid type is not warned for every feature of every render.
*/
const warnedSymbolTypes = new Set();

/**
@function styleIcon

@description
The styleIcon method returns the Openlayers image style for an icon.

The bitmap render is opt in for a layer with the `layer.style.bitmap_icons` flag, which the featureStyle method assigns to the feature style object. A src is rendered as the Openlayers style Icon src where the flag is not set.

A `data:image` src is rendered from a rasterized bitmap. An SVG referenced as an image instantiates a complete isolated SVG document in the browser render engine, and the Openlayers IconImageCache retains it for the lifetime of the session. A bitmap instantiates no document.

A fallback ol.style.Circle is returned while the variant is rasterized. The fallback must not be an Icon with the data URL src, since that would populate the IconImageCache with every variant before any bitmap is ready.

A variant which will not be rasterized, because the rasterization failed or the bitmap limit is reached, is rendered from the data URL src. There is no bitmap to wait for and the symbol must not remain in place of the icon, as the legendIcon element likewise draws the data URL where no bitmap is available.

A src which is a url is not rasterized. It is a single image resource shared by every feature which references it.

@param {object} icon The mapp icon style object.
@param {number} scale The icon scale.
@param {Boolean} [bitmapIcons] The icon should be rendered from a rasterized bitmap.

@returns {Object} An Openlayers image style object.
*/
function styleIcon(icon, scale, bitmapIcons) {
  const anchor = icon.anchor || [0.5, 0.5];

  if (bitmapIcons) {
    const bitmap = iconBitmap(icon.url);

    if (bitmap) {
      // The bitmap was rasterized at the device pixel ratio. The Icon must be scaled by the reciprocal to render at the size the SVG declares.
      return memoizedIcon(`${icon.url}|${anchor}|${scale}`, {
        anchor: anchor,
        img: bitmap.image,
        scale: scale / bitmap.pixelRatio,
      });
    }

    if (icon.url.startsWith('data:') && !bitmapUnavailable(icon.url)) {
      return fallbackIcon(icon);
    }
  }

  return memoizedIcon(`${icon.url}|${anchor}|${scale}`, {
    anchor: anchor,
    crossOrigin: 'anonymous',
    scale: scale,
    src: icon.url,
  });
}

/**
@function memoizedIcon

@description
The memoizedIcon method returns the memoized ol.style.Icon for the key, or creates, stores, and returns an Icon from the options.

@param {string} key The memo key for the icon variant.
@param {Object} options The ol.style.Icon options.

@returns {Object} An Openlayers style Icon object.
*/
function memoizedIcon(key, options) {
  if (memoizedStyleIcons.has(key)) return memoizedStyleIcons.get(key);

  const Icon = new ol.style.Icon(options);

  // Evict the oldest entry before the memo exceeds the styleIconMemoLimit.
  if (memoizedStyleIcons.size >= styleIconMemoLimit) {
    memoizedStyleIcons.delete(memoizedStyleIcons.keys().next().value);
  }

  memoizedStyleIcons.set(key, Icon);

  return Icon;
}

/**
@function fallbackIcon

@description
The fallbackIcon method returns a memoized ol.style.Circle to render an icon variant which has not yet been rasterized.

@param {object} icon The mapp icon style object.

@returns {Object} An Openlayers style Circle object.
*/
function fallbackIcon(icon) {
  fallbackStyle = true;

  const fillColor = icon.fillColor || '#999';

  if (memoizedFallbacks.has(fillColor)) return memoizedFallbacks.get(fillColor);

  const Circle = new ol.style.Circle({
    fill: new ol.style.Fill({ color: fillColor }),
    radius: 6,
    stroke: new ol.style.Stroke({ color: '#333', width: 1 }),
  });

  memoizedFallbacks.set(fillColor, Circle);

  return Circle;
}

/**
@function iconUrl

@description
The iconUrl method returns the url for a mapp icon style object, creating a `data:image` URL from the svgSymbols module methods if the icon has no explicit url or svg source.

The url is assigned to the icon object, which is shared by every feature styled from the same style configuration.

@param {object} icon The mapp icon style object.
@param {object} [feature] The Openlayers feature to style with an icon.

@returns {string} The icon url or data URL.
*/
export function iconUrl(icon, feature) {
  if (icon.url) return icon.url;

  const type = icon.type || 'dot';

  const svgSymbol = mapp.utils.svgSymbols[type];

  if (typeof svgSymbol !== 'function') {
    // The icon url is created for the layer style configuration as well as for the feature render. An invalid type must not throw.
    if (!warnedSymbolTypes.has(type)) {
      warnedSymbolTypes.add(type);
      console.warn(`olStyle: svgSymbols type ${type} unavailable.`);
    }

    return;
  }

  // The url is not assigned where the symbol method fails to create one, eg. a template which is not yet loaded.
  icon.url = icon.svg || svgSymbol(icon, feature);

  return icon.url;
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
@property {Boolean} [style.bitmap_icons] The icon should be rendered from a rasterized bitmap.
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
  if (!iconUrl(icon, feature)) return;

  // Push OL icon Style into Styles array.
  Styles.push(
    new ol.style.Style({
      image: styleIcon(icon, scale, style.bitmap_icons),
      zIndex: style.zIndex,
    }),
  );
}
