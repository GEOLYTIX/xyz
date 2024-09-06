/**
### /ui/elements/legendIcon

The legendIcon module exports the default legendIcon(style) method.

@module /ui/elements/legendIcon
*/

const xmlSerializer = new XMLSerializer();

/**
@function legendIcon

@description
The legendIcon method returns an icon for displaying a mapp-style object outside the mapview.Map canvas.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/
export default function legendIcon(style) {

  if (Array.isArray(style.icon)) {
    return createIconFromArray(style);
  }

  if (style.svg || style.type || style.icon) {
    return createIconFromInlineStyle(style);
  }

  if (!style.fillColor) {
    return createLineSymbol(style);
  }

  if (style.fillColor) {
    return createPolygonSymbol(style);
  }
};

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

  let toLoad = style.icon.length;

  // Images must be loaded in imageStyle image object before they can be applied to canvas.
  function onImgLoad() {
    if (--toLoad) return;

    const vectorContext = ol.render.toContext(canvas.getContext('2d'), {
      size: [style.width, style.height],
      pixelRatio: 1,
    });

    // Styles can not be assigned as array to convas context.
    style.icon.forEach((icon) => {
      vectorContext.setStyle(icon.legendStyle);
      vectorContext.drawGeometry(new ol.geom.Point([canvas.width * 0.5, canvas.height * 0.5]));
    });
  };

  let legendScale = style.icon[0].legendScale || 1;

  style.icon.forEach((icon) => {

    if (icon.type && Object.hasOwn(mapp.utils.svgSymbols, icon.type)) {
      icon.url = mapp.utils.svgSymbols[icon.type](icon);
    }

    const imageStyle = new ol.style.Icon({
      src: icon.svg || icon.url,
      crossOrigin: 'anonymous',
      scale: legendScale * (icon.scale || 1),
      anchor: icon.legendAnchor || [0.5, 0.5]
    })
   
    icon.legendStyle = new ol.style.Style({
      image: imageStyle
    });

    const img = imageStyle.getImage()

    // Check whether the image is loaded in style.
    if (imageStyle.getImageState() === 2) {

      onImgLoad()

    } else {

      img.addEventListener('load', onImgLoad);
      imageStyle.load()
    }
  });

  return canvas;
}

/**
@function createIconFromInlineStyle

@description
The createIconFromInlineStyle creates an icon from an inline style object.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/

function createIconFromInlineStyle(style) {

  const iconUrl = style.icon?.svg
    || style.svg
    || style.icon?.url
    || style.url
    || mapp.utils.svgSymbols[style.icon?.type
    || style.type](style.icon || style)

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
@function createLineSymbol

@description
The createLineSymbol creates an icon for a stroke [line] style object.

@param {feature-style} style A JSON style object.

@returns {HTMLElement} A HTML element for the style.
*/

function createLineSymbol(style) {

  const path = `M 0,${style.height / 2} L ${style.width / 2},${style.height / 2} ${style.width / 2},${style.height / 2} ${style.width},${style.height / 2}`;

  const icon = mapp.utils.svg.node`
  <svg 
    height=${style.height} 
    width=${style.width}>
    <path
      d=${path}
      fill="none"
      stroke=${style.strokeColor}
      stroke-width=${style.strokeWidth || 1}/>`;

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
      fill-opacity=${style.fillOpacity || 1}
      stroke=${style.strokeColor}
      stroke-width=${style.strokeWidth || 1}>`;

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