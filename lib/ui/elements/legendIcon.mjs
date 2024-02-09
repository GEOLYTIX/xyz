const xmlSerializer = new XMLSerializer()

export default (style) => {

  // Create icon
  if (style.svg || style.type || style.icon) return icon(style)

  // Create line symbol
  if (!style.fillColor) return line(style)

  // Create poly symbol.
  if (style.fillColor) return fill(style)

}

function icon(style) {

  // The icon style is an array
  if (Array.isArray(style.icon)) return iconArray(style)

  const inlineStyle = `
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    width: ${(style.width + 'px') || '100%'};
    height: ${(style.height + 'px') || '100%'};
    background-image:url(${style.icon?.svg || style.svg || style.icon?.url || style.url || mapp.utils.svgSymbols[style.icon?.type || style.type](style.icon || params)})`

  return mapp.utils.html`<div style=${inlineStyle}>`
}

function iconArray(style) {

  // Filter out empties from the array.
  style.icon = style.icon.filter(x => x)

  // Create a canvas for the icon
  const canvas = document.createElement('canvas')
  canvas.width = style.width;
  canvas.height = style.height;

  style.toLoad = style.icon.length

  function onImgLoad() {

    // All icon images must be loaded prior to drawing the image with the OL API
    if (--style.toLoad) return;

    // Define the vectorContext for the icon render.
    const vectorContext = ol.render.toContext(canvas.getContext('2d'), {
      size: [style.width, style.height],
      pixelRatio: 1
    });

    // The anchor is defined by the first icon in the array.
    let anchor = style.icon[0].anchor || [0.5, 0.5]

    style.icon.forEach(icon => {

      // The legendStyle must be set for each icon individually.
      vectorContext.setStyle(icon.legendStyle);

      // Draw a point geometry based on the canvas size and the anchor.
      vectorContext.drawGeometry(new ol.geom.Point([canvas.width * anchor[0], canvas.height * anchor[1]]));
    })
  }

  // The legendStyle should be defined on the first icon in the icon array.
  let legendScale = style.icon[0].legendScale || 1

  // Create a legendStyle for each icon in the array.
  style.icon.forEach(icon => {

    if (icon.legendStyle) {
      onImgLoad()
      return;
    }

    // The icon.url must be generated from the svgSymbols utility library.
    if (icon.type && Object.hasOwn(mapp.utils.svgSymbols, icon.type)) {
      icon.url = mapp.utils.svgSymbols[icon.type](icon)
    }

    try {

      icon.legendStyle = new ol.style.Style({
        image: new ol.style.Icon({
          src: icon.svg || icon.url,
          crossOrigin: 'anonymous',
          scale: legendScale * (icon.scale || 1),
          anchor: icon.legendAnchor || icon.anchor || [0.5, 0.5],
        })
      })

    } catch (err) {

      console.error(err)
      console.log(icon)
      return;
    }

    // Assign a load event for the image and load the image.
    const image = icon.legendStyle.getImage()

    const image1 = image.getImage(1)

    if (image1.src) {

      onImgLoad()
    } else {

      image1.addEventListener('load', onImgLoad)
      image.load();
    }

  })

  return canvas;
}

function line(style) {

  let path = `
  M 0,${style.height / 2}
  L ${style.width / 2},${style.height / 2}
  ${style.width / 2},${style.height / 2}
  ${style.width},${style.height / 2}`

  let icon = mapp.utils.svg.node`
  <svg height=${style.height} width=${style.width}>
    <path d=${path}
      fill="none"
      stroke=${style.strokeColor}
      stroke-width=${style.strokeWidth || 1}/>`

  let backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`

  let inlineStyle = `
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  width: ${style.width}px;
  height: ${style.height}px;
  background-image: url(${backgroundImage});`

  return mapp.utils.html`<div style=${inlineStyle}>`
}

function fill(style) {

  let icon = mapp.utils.svg.node`
  <svg height=${style.height} width=${style.width}>
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
      stroke-width=${style.strokeWidth || 1}>`

  let backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`

  let inlineStyle = `
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  width: ${style.width}px;
  height: ${style.height}px;
  background-image: url(${backgroundImage});`

  return mapp.utils.html`<div style=${inlineStyle}>`
}