/**
### /ui/elements/legendIcon

The legendIcon module exports the default legendIcon(style) method.

@module /ui/elements/legendIcon
*/

const xmlSerializer = new XMLSerializer();

/**
The width and height for a legend icon element where the style declares none.
*/
const legendIconSize = 24;

/**
@function legendIcon

@description
The legendIcon method returns an icon for displaying a mapp-style object outside the mapview.Map canvas.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/
export default function legendIcon(style) {
  // Create an array to hold the legend icons.
  // This is required to support multiple icons in a single style.
  const legendIcons = [];

  // If the style.icon is an array, we will create a layered icon.
  if (Array.isArray(style.icon)) {
    legendIcons.push(createIconFromArray(style));
  } else if (style.icon || style.svg || style.type) {
    // If the style.icon is an inline style, we will create an icon from it.
    legendIcons.push(createIconFromInlineStyle(style));
  }

  // If the style is a polygon, we will create a polygon symbol.
  if (style.fillColor) {
    legendIcons.push(createPolygonSymbol(style));
  }

  // If the style is a line, we will create a line symbol.
  if (style.strokeColor && !style.fillColor) {
    legendIcons.push(createLineSymbol(style));
  }

  const icon = mapp.utils.html.node`<div class="legend-icon">${legendIcons}`;

  // return the legend icons.
  return icon;
}

/**
@function createIconFromArray

@description
The createIconFromArray method iterates through an `style.icon[]` array to create a layered and scaled icon element for displaying an icon style.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/
function createIconFromArray(style) {
  const canvas = document.createElement('canvas');
  canvas.width = style.width;
  canvas.height = style.height;

  // The icon variants are rasterized before the icons are drawn. A `data:image` src assigned to an Openlayers style Icon would be retained by the IconImageCache as an isolated SVG document.
  const urls = style.icon.map(
    (icon) => icon.url || icon.svg || svgSymbolUrl(icon),
  );

  mapp.utils.svgBitmap
    .requestBitmaps(urls)
    .then(() => drawIcons(canvas, style));

  return canvas;
}

/**
@function drawIcons

@description
The drawIcons method draws the `style.icon[]` array into the canvas of a layered legend icon.

@param {HTMLElement} canvas The canvas element to draw the icons into.
@param {feature-style} style A JSON style object.
*/
function drawIcons(canvas, style) {
  let toLoad = style.icon.length;

  // Images must be loaded in imageStyle image object before they can be applied to canvas.
  function onImgLoad() {
    if (--toLoad) return;

    const vectorContext = ol.render.toContext(canvas.getContext('2d'), {
      pixelRatio: 1,
      size: [style.width, style.height],
    });

    // Styles can not be assigned as array to convas context.
    style.icon.forEach((icon) => {
      vectorContext.setStyle(icon.legendStyle);
      vectorContext.drawGeometry(
        new ol.geom.Point([canvas.width * 0.5, canvas.height * 0.5]),
      );
    });
  }

  const legendScale = style.icon[0].legendScale || 1;

  for (const icon of style.icon) {
    const iconUrl = icon.url || icon.svg || svgSymbolUrl(icon);

    if (!iconUrl) {
      console.warn(
        'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
        icon,
      );
      continue;
    }

    const imageStyle = legendImageStyle(
      iconUrl,
      icon.legendAnchor || [0.5, 0.5],
      legendScale * (icon.scale || 1),
    );

    icon.legendStyle = new ol.style.Style({
      image: imageStyle,
    });

    const img = imageStyle.getImage();

    // Check whether the image is loaded in style.
    if (imageStyle.getImageState() === 2) {
      onImgLoad();
    } else {
      img.addEventListener('load', onImgLoad);
      imageStyle.load();
    }
  }

  return canvas;
}

/**
@function legendImageStyle

@description
The legendImageStyle method returns an Openlayers style Icon for a legend icon.

A `data:image` src is rendered from a rasterized bitmap where one is available. A bitmap backed Icon is loaded on creation, so the load state check of the drawIcons method resolves immediately.

@param {string} src The icon url or data URL.
@param {array} anchor The icon anchor.
@param {number} scale The icon scale.

@returns {Object} An Openlayers style Icon object.
*/
function legendImageStyle(src, anchor, scale) {
  const bitmap = mapp.utils.svgBitmap.iconBitmap(src);

  if (bitmap) {
    return new ol.style.Icon({
      anchor: anchor,
      img: bitmap.image,
      scale: scale / bitmap.pixelRatio,
    });
  }

  return new ol.style.Icon({
    anchor: anchor,
    crossOrigin: src.startsWith('data:') ? undefined : 'anonymous',
    scale: scale,
    src: src,
  });
}

/**
@function createIconFromInlineStyle

@description
The createIconFromInlineStyle creates an icon from an inline style object.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/

function createIconFromInlineStyle(style) {
  const iconUrl =
    style.icon?.svg ||
    style.svg ||
    style.icon?.url ||
    style.url ||
    svgSymbolUrl(style.icon || style);

  if (!iconUrl) {
    console.warn(
      'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
      style.icon || style,
    );
  }

  // A `data:image` background image instantiates an isolated SVG document for as long as the element is in the document. The rasterized bitmap is drawn into a canvas instead.
  if (iconUrl?.startsWith('data:')) return createIconFromBitmap(iconUrl, style);

  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${style.width + 'px' || '100%'};
    height: ${style.height + 'px' || '100%'};
    background-image: url(${iconUrl})`;

  return mapp.utils.html.node`<div style=${inlineStyle}>`;
}

/**
@function createIconFromBitmap

@description
The createIconFromBitmap method returns a canvas element with the rasterized bitmap of a `data:image` URL drawn into it.

The canvas is returned before the bitmap is available. The bitmap is drawn into the canvas element once it has been rasterized.

@param {string} src The data URL for the icon.
@param {feature-style} style A JSON style object.

@returns {HTMLElement} A canvas element for the style.
*/
function createIconFromBitmap(src, style) {
  const width = style.width || legendIconSize;
  const height = style.height || legendIconSize;

  const inlineStyle = `width: ${width}px; height: ${height}px;`;

  const canvas = mapp.utils.html.node`<canvas
    style=${inlineStyle}>`;

  mapp.utils.svgBitmap.requestBitmaps([src]).then(() => {
    const bitmap = mapp.utils.svgBitmap.iconBitmap(src);

    if (!bitmap) {
      const fallbackStyle = `
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        width: ${width}px;
        height: ${height}px;
        background-image: url(${src})`;

      const fallback = mapp.utils.html.node`<div style=${fallbackStyle}>`;

      canvas.replaceWith(fallback);

      return;
    }

    canvas.width = bitmap.image.width;
    canvas.height = bitmap.image.height;

    canvas.getContext('2d').drawImage(bitmap.image, 0, 0);
  });

  return canvas;
}

/**
@function svgSymbolUrl

@description
The svgSymbolUrl function returns the URL for an SVG symbol based on its type.

The method will return undefined if the symbol type is not found in the mapp.utils.svgSymbols object. This is to prevent errors when an invalid symbol type is provided.

@param {string} icon The icon type to create from svgSymbols.

@returns {SVGElement} Icon SVG element from mapp.utils.svgSymbols.
*/
function svgSymbolUrl(icon) {
  // Assign 'dot' as default.
  icon.type ??= 'dot';

  if (!Object.hasOwn(mapp.utils.svgSymbols, icon.type)) return;

  return mapp.utils.svgSymbols[icon.type](icon);
}

/**
@function createLineSymbol

@description
The createLineSymbol creates an icon for a stroke [line] style object.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/
function createLineSymbol(style) {
  const path = `M 0,${style.height / 2} L ${style.width / 2},${style.height / 2} ${style.width / 2},${style.height / 2} ${style.width},${style.height / 2}`;

  style.strokeWidth ??= 1;
  style.lineDash ??= '';

  const icon = mapp.utils.svg.node`
  <svg
    height=${style.height}
    width=${style.width}>
    <path
      d=${path}
      fill="none"
      stroke=${style.strokeColor}
      stroke-width=${style.strokeWidth}
      stroke-dasharray=${style.lineDash} />`;

  const backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;

  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${style.width}px;
    height: ${style.height}px;
    background-image: url(${backgroundImage});`;

  return mapp.utils.html`<div style=${inlineStyle}>`;
}

/**
@function createPolygonSymbol

@description
The createPolygonSymbol creates an icon for a fill [polygon] style object.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/
function createPolygonSymbol(style) {
  style.fillOpacity ??= 1;
  style.strokeWidth ??= 1;
  style.lineDash ??= '';

  const icon = mapp.utils.svg.node`
  <svg
    height=${style.height}
    width=${style.width}>
    <rect
      x=${style.strokeWidth || 1}
      y=${style.strokeWidth || 1}
      rx="4px"
      ry="4px"
      stroke-linejoin="round"
      width=${style.width - 2 * (style.strokeWidth || 1)}
      height=${style.height - 2 * (style.strokeWidth || 1)}
      fill=${style.fillColor}
      fill-opacity=${style.fillOpacity}
      stroke=${style.strokeColor}
      stroke-width=${style.strokeWidth}
      stroke-dasharray=${style.lineDash} >`;

  const backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;

  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${style.width}px;
    height: ${style.height}px;
    background-image: url(${backgroundImage});`;

  return mapp.utils.html`<div style=${inlineStyle}>`;
}
