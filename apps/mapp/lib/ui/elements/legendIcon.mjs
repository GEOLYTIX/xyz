/**
### /ui/elements/legendIcon

The legendIcon module exports the default legendIcon(style) method.

The icon url is resolved with the mapp.utils.iconUrl method and rendered with the mapp.utils.imageStyle method, so that the legend icon and the feature render of the mapview.Map resolve and draw an icon style object by the same rules.

@requires /utils/olStyle

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

The bitmap render is opt in with the `layer.style.bitmap_icons` flag, which the legend module assigns to the style object of the layer it renders. An icon is drawn from the `data:image` src itself where the flag is not set.

@param {feature-style} style A JSON style object.
@property {Boolean} [style.bitmap_icons] The icon should be drawn from a rasterized bitmap.

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
@property {Boolean} [style.bitmap_icons] The icons should be drawn from rasterized bitmaps.

@returns {HTMLElement} A HTML element for the style.
*/
function createIconFromArray(style) {
  const width = style.width || legendIconSize;
  const height = style.height || legendIconSize;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  if (!style.bitmap_icons) {
    drawIcons(canvas, style, width, height);
    return canvas;
  }

  // The icon variants are rasterized before the icons are drawn. A `data:image` src assigned to an Openlayers style Icon would be retained by the IconImageCache as an isolated SVG document.
  const urls = style.icon.map((icon) => mapp.utils.iconUrl(icon));

  mapp.utils.svgBitmap
    .requestBitmaps(urls)
    .then(() => drawIcons(canvas, style, width, height));

  return canvas;
}

/**
@function drawIcons

@description
The drawIcons method draws the `style.icon[]` array into the canvas of a layered legend icon.

The canvas is sized from the ratio of the layered icons within the width and height bounds, and the icons are scaled to fit. A canvas which is not sized to the same ratio clips a non square icon.

The image styles are memoized by the imageStyle method and are shared with the feature render of the mapview.Map. An ol.style.Icon must not be mutated, so the fitted style is requested rather than the ratio being set as the scale of the style the icons were measured from.

@param {HTMLElement} canvas The canvas element to draw the icons into.
@param {feature-style} style A JSON style object.
@param {number} width The width bound for the legend icon.
@param {number} height The height bound for the legend icon.
@property {Boolean} [style.bitmap_icons] The icons should be drawn from rasterized bitmaps.
*/
function drawIcons(canvas, style, width, height) {
  let toLoad = style.icon.length;

  // Images must be loaded in imageStyle image object before they can be applied to canvas.
  function onImgLoad() {
    if (--toLoad) return;

    const images = style.icon
      .map((icon) => icon.legendStyle?.getImage())
      .filter(Boolean);

    // The icons are layered on the same point, so the composite occupies the largest drawn width and the largest drawn height.
    const drawn = images.map((image) => {
      const size = image.getImageSize() || [width, height];
      const scale = image.getScale() || 1;
      return [size[0] * scale, size[1] * scale];
    });

    const compositeWidth = Math.max(...drawn.map((size) => size[0]));
    const compositeHeight = Math.max(...drawn.map((size) => size[1]));

    // The composite is fitted within the bounds. An icon is scaled by the same ratio so that it occupies the canvas it is drawn into.
    const ratio = fitRatio(width, height, compositeWidth, compositeHeight);

    const size = [
      (compositeWidth || width) * ratio,
      (compositeHeight || height) * ratio,
    ];

    // The fitted style is requested for the scale the icon is drawn at. The Openlayers IconImageCache holds the image of the style the icon was measured from, so the fitted style is loaded on creation.
    style.icon.forEach((icon) => {
      if (!icon.legendStyle) return;

      icon.legendStyle = new ol.style.Style({
        image: legendImageStyle(icon, style, legendScale, ratio),
      });
    });

    const vectorContext = ol.render.toContext(canvas.getContext('2d'), {
      pixelRatio: 1,
      size,
    });

    // Styles can not be assigned as array to convas context.
    // The geometry is drawn in the size units of the context, which the pixelRatio is applied to.
    style.icon.forEach((icon) => {
      vectorContext.setStyle(icon.legendStyle);
      vectorContext.drawGeometry(
        new ol.geom.Point([size[0] * 0.5, size[1] * 0.5]),
      );
    });
  }

  const legendScale = style.icon[0].legendScale || 1;

  for (const icon of style.icon) {
    const iconUrl = mapp.utils.iconUrl(icon);

    if (!iconUrl) {
      console.warn(
        'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
        icon,
      );
      continue;
    }

    const imageStyle = legendImageStyle(icon, style, legendScale);

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
The legendImageStyle method returns the Openlayers image style for an icon of a layered legend icon.

No fallback is passed to the imageStyle method. The legend draws the image itself and is not redrawn, so a provisional symbol would remain in place of the icon.

@param {object} icon The mapp icon style object.
@param {feature-style} style A JSON style object.
@param {number} legendScale The scale of the layered legend icon.
@param {number} [ratio] The ratio the icon is fitted within the legend icon bounds by.
@property {Boolean} [style.bitmap_icons] The icon should be drawn from a rasterized bitmap.

@returns {Object} An Openlayers image style object.
*/
function legendImageStyle(icon, style, legendScale, ratio) {
  return mapp.utils.imageStyle({
    anchor: icon.legendAnchor,
    bitmap: style.bitmap_icons,
    scale: legendScale * (icon.scale || 1) * (ratio || 1),
    url: mapp.utils.iconUrl(icon),
  });
}

/**
@function createIconFromInlineStyle

@description
The createIconFromInlineStyle creates an icon from an inline style object.

@param {feature-style} style A JSON style object.
@property {Boolean} [style.bitmap_icons] The icon should be drawn from a rasterized bitmap.

@returns {HTMLElement} A HTML element for the style.
*/

function createIconFromInlineStyle(style) {
  // The style object itself holds the icon properties where it has no icon object.
  const iconUrl = mapp.utils.iconUrl(style.icon || style);

  if (!iconUrl) {
    console.warn(
      'legendIcon: icon has no url, the svg or template may be missing/invalid: ',
      style.icon || style,
    );
  }

  // A `data:image` background image instantiates an isolated SVG document for as long as the element is in the document. The rasterized bitmap is drawn into a canvas instead.
  if (style.bitmap_icons && iconUrl?.startsWith('data:')) {
    return createIconFromBitmap(iconUrl, style);
  }

  return backgroundImage(
    iconUrl,
    style.width || legendIconSize,
    style.height || legendIconSize,
  );
}

/**
@function createIconFromBitmap

@description
The createIconFromBitmap method returns a canvas element with the rasterized bitmap of a `data:image` URL drawn into it.

The canvas is returned before the bitmap is available. The bitmap is drawn into the canvas element once it has been rasterized.

The element is sized from the ratio of the rasterized icon within the style width and height, which default to the legendIconSize. A non square icon is not stretched to fill a square cell.

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
      canvas.replaceWith(backgroundImage(src, width, height));

      return;
    }

    canvas.width = bitmap.image.width;
    canvas.height = bitmap.image.height;

    // The bitmap was rasterized at the device pixel ratio from the intrinsic dimensions the SVG declares.
    const intrinsicWidth = bitmap.image.width / bitmap.pixelRatio;
    const intrinsicHeight = bitmap.image.height / bitmap.pixelRatio;

    // The element takes the ratio of the icon within the width and height bounds. The canvas is drawn at the dimensions of the bitmap, and an element which is not sized to the same ratio stretches it: a 20x30 icon in a 24x24 cell would render 24x24.
    const ratio = fitRatio(width, height, intrinsicWidth, intrinsicHeight);

    canvas.style.width = `${intrinsicWidth * ratio}px`;
    canvas.style.height = `${intrinsicHeight * ratio}px`;

    canvas.getContext('2d').drawImage(bitmap.image, 0, 0);
  });

  return canvas;
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

  return backgroundImage(svgDataUrl(icon), style.width, style.height);
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

  return backgroundImage(svgDataUrl(icon), style.width, style.height);
}

/**
@function backgroundImage

@description
The backgroundImage method returns a div element which draws the url as a contained background image.

@param {string} url The image url or data URL.
@param {number} width The element width in pixels.
@param {number} height The element height in pixels.

@returns {HTMLElement} A div element for the url.
*/
function backgroundImage(url, width, height) {
  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${width}px;
    height: ${height}px;
    background-image: url(${url});`;

  return mapp.utils.html.node`<div style=${inlineStyle}>`;
}

/**
@function svgDataUrl

@description
The svgDataUrl method returns the `data:image` URL for an SVG element, as the svgSymbols module methods do for the symbol they create.

@param {Object} icon An SVG element.

@returns {string} The data URL for the element.
*/
function svgDataUrl(icon) {
  return `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
}

/**
@function fitRatio

@description
The fitRatio method returns the ratio by which an icon of the intrinsic dimensions is scaled to occupy the width and height bounds of a legend icon without being stretched.

A dimension which could not be established takes the bound it is fitted within, so that the ratio for it is 1.

@param {number} width The width bound for the legend icon.
@param {number} height The height bound for the legend icon.
@param {number} intrinsicWidth The width the icon is drawn at.
@param {number} intrinsicHeight The height the icon is drawn at.

@returns {number} The ratio to scale the icon by.
*/
function fitRatio(width, height, intrinsicWidth, intrinsicHeight) {
  return Math.min(
    width / (intrinsicWidth || width),
    height / (intrinsicHeight || height),
  );
}
