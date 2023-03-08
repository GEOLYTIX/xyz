mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_zoom_to_extent: 'Zoom to filtered layer extent',
    layer_visibility: 'Toggle visibility',
  },
  de: {
    layer_zoom_to_extent: 'Zoom zum Ausmaß des gefilterten Datensatzes',
    layer_visibility: 'Umschalten der Ansicht',
  },
  cn: {
    layer_zoom_to_extent: '缩放至相应筛选范围',
    layer_visibility: '切换可见性',
  },
  pl: {
    layer_zoom_to_extent: 'Pokaż zasięg warstwy',
    layer_visibility: 'Widoczność',
  },
  ko: {
    layer_zoom_to_extent: '필터된 레이어크기에 줌(zoom)',
    layer_visibility: '토글 가시성',
  },
  fr: {
    layer_zoom_to_extent: 'Zoom sur l\'étendue de la couche',
    layer_visibility: 'Changer la visiblité',
  },
  ja: {
    layer_zoom_to_extent: 'フィルターされたレイヤー範囲をズームに',
    layer_visibility: '表示切替',
  }
})

export default (layer) => {

  if (layer.view === null) {
    
    // Do not create a layer view.
    return;
  }

  layer.view = mapp.utils.html.node`<div class="layer-view">`
    
  // Create content from layer view panels and plugins
  const content = Object.keys(layer)
    .map(key => mapp.ui.layers.panels[key] && mapp.ui.layers.panels[key](layer))
    .filter(panel => typeof panel !== 'undefined')

  // Set default order for panel if not explicit in layer config.
  layer.panelOrder = layer.panelOrder || ['draw-drawer','dataviews-drawer','filter-drawer','style-drawer','meta']

  content.sort((a,b)=>{

    // Sort according to data-id in panelOrder array.
    return layer.panelOrder.findIndex(chk => chk === a.dataset?.id)
      < layer.panelOrder.findIndex(chk => chk === b.dataset?.id)
      ? 1 : -1;
  })

  if (layer.drawer !== null) {

    const zoomToExtent = layer.filter.zoomToExtent && mapp.utils.html`
      <button
        data-id=zoomToExtent
        title=${mapp.dictionary.layer_zoom_to_extent}
        class="mask-icon fullscreen"
        onclick=${async e=>{
          
          // response indicates whether locations were found.
          let response = await layer.zoomToExtent()

          // disable button if no locations were found.
          e.target.disabled = !response
        }}>` || ``
 
    // Create toogleDisplay button for header.
    const toggleDisplay = mapp.utils.html.node`
      <button
        data-id=display-toggle
        title=${mapp.dictionary.layer_visibility}
        class="${`mask-icon toggle ${layer.display && 'on' || 'off'}`}"
        onclick=${e => layer.display ? layer.hide() : layer.show()}>`

    // Add on callback for toggle button.
    layer.showCallbacks.push(() => {
      toggleDisplay.classList.add('on')
    })

    // Remove on callback for toggle button.
    layer.hideCallbacks.push(() => {
      toggleDisplay.classList.remove('on')
    })

    const header = mapp.utils.html`
      <h2>${layer.name || layer.key}</h2>
      ${zoomToExtent}
      ${toggleDisplay}
      <div class="mask-icon expander"></div>`

    // Create layer drawer node.
    layer.drawer = mapp.ui.elements.drawer({
      data_id: `layer-drawer`,
      class: `layer-view raised ${content.length ? '' : 'empty'}`,
      header: header,
      content: content
    })

    // Render layer.drawer into layer.view
    mapp.utils.render(layer.view, layer.drawer)

  } else {

    // Append elements directly to layer.view
    content.forEach(el => layer.view.append(el))
  }

  // The layer view drawer should be disabled if layer.tables are not available for the current zoom level.
  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', ()=>{
    if (!layer.tables) return;
    if (layer.tableCurrent() === null) return layer.view.classList.add('disabled')
    layer.view.classList.remove('disabled')
  })
}