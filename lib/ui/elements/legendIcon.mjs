const xmlSerializer = new XMLSerializer();

/**
 * ### legendIcon
 * The legendIcon module generates an SVG icon or a symbol based on the provided parameters.
 *
 * This function takes an object of parameters and generates an SVG icon or symbol
 * based on those parameters. It supports generating icons from SVG source, icon type,
 * or a combination of icon configurations. It can also generate line symbols and
 * polygon symbols based on the provided stroke and fill colors.
 *
 * The function returns the generated icon or symbol as an HTML element that can be
 * inserted into the DOM.
 * 
 * @module /ui/elements/legendIcon
 */

/**
* @function legendIcon  
* @param {Object} style - The parameters for generating the icon or symbol.
* @param {string} [style.svg] - The SVG source for the icon.
* @param {string} [style.type] - The type of the icon.
* @param {Array|Object} [style.icon] - The icon configuration or an array of icon configurations.
* @param {number} style.width - The width of the icon or symbol.
* @param {number} style.height - The height of the icon or symbol.
* @param {string} [style.strokeColor] - The stroke color of the line symbol.
* @param {number} [style.strokeWidth] - The stroke width of the line symbol.
* @param {string} [style.fillColor] - The fill color of the polygon symbol.
* @param {number} [style.fillOpacity] - The fill opacity of the polygon symbol.
* @returns {HTMLElement} The generated icon or symbol as an HTML element.
*/
export default (style) => {
  if (style.svg || style.type || style.icon) {
    if (Array.isArray(style.icon)) {
      return createIconFromArray(style);
    }
    return createIconFromInlineStyle(style);
  }

  if (!style.fillColor) {
    return createLineSymbol(style);
  }

  if (style.fillColor) {
    return createPolygonSymbol(style);
  }
};

function createIconFromArray(style) {
  const canvas = document.createElement('canvas');
  canvas.width = style.width;
  canvas.height = style.height;

  let toLoad = style.icon.length;
  const onImgLoad = () => {
    if (--toLoad) return;

    const vectorContext = ol.render.toContext(canvas.getContext('2d'), {
      size: [style.width, style.height],
      pixelRatio: 1,
    });

    style.icon.forEach((icon) => {
      vectorContext.setStyle(icon.legendStyle);
      vectorContext.drawGeometry(new ol.geom.Point([canvas.width * 0.5, canvas.height * 0.5]));
    });
  };

  let legendScale = style.icon[0].legendScale || 1;

  style.icon.forEach((icon) => {
    if (icon.legendStyle) {
      onImgLoad();
      return;
    }

    if (icon.type && Object.hasOwn(mapp.utils.svgSymbols, icon.type)) {
      icon.url = mapp.utils.svgSymbols[icon.type](icon);
    }
    
    icon.legendStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: icon.svg || icon.url,
        crossOrigin: 'anonymous',
        scale: legendScale * (icon.scale || 1),
        anchor: icon.legendAnchor || icon.anchor || [0.5, 0.5],
      }),
    });

    const image = icon.legendStyle.getImage();
    image.getImage(1).addEventListener('load', onImgLoad);
    image.load();
  });

  return canvas;
}

function createIconFromInlineStyle(style) {
  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${style.width + 'px' || '100%'};
    height: ${style.height + 'px' || '100%'};
    background-image: url(${style.icon?.svg || style.svg || style.icon?.url || style.url || mapp.utils.svgSymbols[style.icon?.type || style.type](style.icon || style)})`;

  return mapp.utils.html`<div style=${inlineStyle}>`;
}

function createLineSymbol(style) {
  const path = `M 0,${style.height / 2} L ${style.width / 2},${style.height / 2} ${style.width / 2},${style.height / 2} ${style.width},${style.height / 2}`;
  const icon = mapp.utils.svg.node`<svg height=${style.height} width=${style.width}><path d=${path} fill="none" stroke=${style.strokeColor} stroke-width=${style.strokeWidth || 1}/>`;
  const backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
  const inlineStyle = `background-position: center; background-repeat: no-repeat; background-size: contain; width: ${style.width}px; height: ${style.height}px; background-image: url(${backgroundImage});`;
  return mapp.utils.html`<div style=${inlineStyle}>`;
}

function createPolygonSymbol(style) {
  const icon = mapp.utils.svg.node`<svg height=${style.height} width=${style.width}><rect x=${style.strokeWidth || 1} y=${style.strokeWidth || 1} rx="4px" ry="4px" stroke-linejoin="round" width=${style.width - 2 * (style.strokeWidth || 1)} height=${style.height - 2 * (style.strokeWidth || 1)} fill=${style.fillColor} fill-opacity=${style.fillOpacity || 1} stroke=${style.strokeColor} stroke-width=${style.strokeWidth || 1}>`;
  const backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`;
  const inlineStyle = `background-position: center; background-repeat: no-repeat; background-size: contain; width: ${style.width}px; height: ${style.height}px; background-image: url(${backgroundImage});`;
  return mapp.utils.html`<div style=${inlineStyle}>`;
}