const xmlSerializer = new XMLSerializer()

export default (params) => {

  if (params.svg || params.type || params.layers) {

    let backgroundImage = params.layers 
      && Array.isArray(params.layers)
      && params.layers
      .map(_l => `url(${_l.svg})`)
      .reverse()
      .join(',')
      || `url(${params.svg || params.url || mapp.utils.svgSymbols[params.type](params)})`

    let inlineStyle = `
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${(params.width + 'px') || '100%'};
      height: ${(params.height + 'px') || '100%'};
      background-image:${backgroundImage};`
  
    return mapp.utils.html`<div style=${inlineStyle}>`

  }

  if (!params.fillColor && params.strokeColor) {

    let path = `
      M 0,${params.height/2}
      L ${params.width/2},${params.height/2}
      ${params.width/2},${params.height/2}
      ${params.width},${params.height/2}`

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