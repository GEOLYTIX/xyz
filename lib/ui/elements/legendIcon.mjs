const xmlSerializer = new XMLSerializer()

export default (params) => {

  // Create icon
  if (params.svg || params.type || params.icon) {

    let backgroundImage = Array.isArray(params.icon)

      //? `url(${params.icon[0].svg || params.icon[0].url || mapp.utils.svgSymbols[params.icon[0].type](params.icon[0])})`

      ? params.icon
          .map(icon => `url(${icon.svg || icon.url || mapp.utils.svgSymbols[icon.type](icon)})`)
          .reverse()
          .join(',')

      : `url(${params.icon?.svg || params.svg || params.icon?.url || params.url || mapp.utils.svgSymbols[params.icon?.type || params.type](params.icon || params)})`

    let inlineStyle = `
      background-position: center;
      background-repeat: no-repeat;
      background-size: contain;
      width: ${(params.width + 'px') || '100%'};
      height: ${(params.height + 'px') || '100%'};
      background-image:${backgroundImage};`
  
    return mapp.utils.html`<div style=${inlineStyle}>`
  }

  // Create line symbol
  if (!params.fillColor) {

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