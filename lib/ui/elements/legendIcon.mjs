const xmlSerializer = new XMLSerializer()

export default (params) => {

  // Create icon
  if (params.svg || params.type || params.icon) {

    // The icon style is an array
    if (Array.isArray(params.icon)) {

      // Create a canvas for the icon
      const canvas = document.createElement('canvas')
      canvas.width = params.width;
      canvas.height = params.height;

      let toLoad = params.icon.length++
      function onImgLoad() {
  
        // All icon images must be loaded prior to drawing the image with the OL API
        if (--toLoad) return;

        // Define the vectorContext for the icon render.
        const vectorContext = ol.render.toContext(canvas.getContext("2d"), {
          size: [params.width, params.height]
        });

        // The anchor is defined by the first icon in the array.
        let anchor = params.icon[0].anchor || [0.5, 0.5]

        params.icon.forEach(icon => {

          // The legendStyle must be set for each icon individually.
          vectorContext.setStyle(icon.legendStyle);

          // Draw a point geometry based on the canvas size and the anchor.
          vectorContext.drawGeometry(new ol.geom.Point([canvas.width * anchor[0], canvas.height * anchor[1]]));
        })

      }

      // The legendStyle should be defined on the first icon in the icon array.
      let legendScale = params.icon[0].legendScale || 1

      // Create a legendStyle for each icon in the array.
      params.icon.forEach(icon => {

        icon.legendStyle = new ol.style.Style({
          image: new ol.style.Icon({
            src: icon.svg,
            crossOrigin: 'anonymous',
            scale: legendScale * (icon.scale || 1),
            anchor: icon.legendAnchor || icon.anchor || [0.5, 0.5],
          })
        })

        // Assign a load event for the image and load the image.
        icon.legendStyle.getImage().getImage(1).addEventListener('load', onImgLoad);
        icon.legendStyle.getImage().load();
      })

      return canvas;
    }

    const inlineStyle = `
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${(params.width + 'px') || '100%'};
      height: ${(params.height + 'px') || '100%'};
      background-image:url(${params.icon?.svg || params.svg || params.icon?.url || params.url || mapp.utils.svgSymbols[params.icon?.type || params.type](params.icon || params)})`

    return mapp.utils.html`<div style=${inlineStyle}>`
  }

  // Create line symbol
  if (!params.fillColor) {

    let path = `
      M 0,${params.height / 2}
      L ${params.width / 2},${params.height / 2}
      ${params.width / 2},${params.height / 2}
      ${params.width},${params.height / 2}`

    let icon = mapp.utils.svg.node`
      <svg height=${params.height} width=${params.width}>
        <path d=${path}
          fill="none"
          stroke=${params.strokeColor}
          stroke-width=${params.strokeWidth || 1}/>`

    let backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`

    let inlineStyle = `
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${params.width}px;
      height: ${params.height}px;
      background-image: url(${backgroundImage});`

    return mapp.utils.html`<div style=${inlineStyle}>`
  }

  // Create poly symbol.
  if (params.fillColor) {

    let icon = mapp.utils.svg.node`
      <svg height=${params.height} width=${params.width}>
        <rect
          x=${params.strokeWidth || 1}
          y=${params.strokeWidth || 1}
          rx="4px"
          ry="4px"
          stroke-linejoin="round"
          width=${params.width - 2 * (params.strokeWidth || 1)}
          height=${params.height - 2 * (params.strokeWidth || 1)}
          fill=${params.fillColor}
          fill-opacity=${params.fillOpacity || 1}
          stroke=${params.strokeColor}
          stroke-width=${params.strokeWidth || 1}>`

    let backgroundImage = `data:image/svg+xml,${encodeURIComponent(xmlSerializer.serializeToString(icon))}`

    let inlineStyle = `
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${params.width}px;
      height: ${params.height}px;
      background-image: url(${backgroundImage});`

    return mapp.utils.html`<div style=${inlineStyle}>`
  }

}