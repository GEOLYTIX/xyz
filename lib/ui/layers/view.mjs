mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_zoom_to_extent: "Zoom to filtered layer extent",
    layer_visibility: "Toggle visibility",
  },
  de: {
    layer_zoom_to_extent: "Zoom zum Ausmaß des gefilterten Datensatzes",
    layer_visibility: "Umschalten der Ansicht",
  },
  cn: {
    layer_zoom_to_extent: "缩放至相应筛选范围",
    layer_visibility: "切换可见性",
  },
  pl: {
    layer_zoom_to_extent: "Pokaż zasięg warstwy",
    layer_visibility: "Widoczność",
  },
  ko: {
    layer_zoom_to_extent: "필터된 레이어크기에 줌(zoom)",
    layer_visibility: "토글 가시성",
  },
  fr: {
    layer_zoom_to_extent: "Zoom sur l'étendue de la couche",
    layer_visibility: "Changer la visiblité",
  },
  ja: {
    layer_zoom_to_extent: "フィルターされたレイヤー範囲をズームに",
    layer_visibility: "表示切替",
  }
})

export default (layer) => {

  const fullScreen = layer.filter.zoomToExtent && mapp.utils.html`
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
 
  const toggleDisplay = mapp.utils.html.node`
    <button
      data-id=display-toggle
      title=${mapp.dictionary.layer_visibility}
      class="${`mask-icon toggle ${layer.display && 'on' || 'off'}`}"
      onclick=${e=>{
        layer.display ? layer.hide() : layer.show()
      }}>`

  const header = mapp.utils.html`
    <h2>${layer.name || layer.key}</h2>
    ${fullScreen}
    ${toggleDisplay}
    <div class="mask-icon expander"></div>`
    
  // Create content from layer view panels and plugins
  const content = Object.keys(layer)
    .map(key => mapp.ui.layers.panels[key] && mapp.ui.layers.panels[key](layer))
    .filter(panel => typeof panel !== 'undefined')

  if (layer.meta) {
    const meta = mapp.utils.html.node`<p class="meta">`
    meta.innerHTML = layer.meta
    content.unshift(meta)
  }

  layer.view = mapp.ui.elements.drawer({
    data_id: `layer-drawer`,
    class: 'layer-view raised',
    header: header,
    content: content
  })

  // Add tabs array to layer.
  layer.tabs = []

  layer.showCallbacks.push(()=>{
    toggleDisplay.classList.add("on")
    layer.tabs?.forEach(tab => tab.display && tab.show && tab.show())
  })

  layer.hideCallbacks.push(()=>{
    toggleDisplay.classList.remove("on")
    layer.tabs?.forEach(tab => tab.remove())
  })

  // The layer view drawer should be disabled if layer.tables are not available for the current zoom level.
  layer.mapview.Map.getTargetElement().addEventListener('changeEnd', ()=>{
    if (!layer.tables) return;
    if (layer.tableCurrent() === null) return layer.view.classList.add("disabled")
    layer.view.classList.remove("disabled")
  })

  // Adding the empty class to the layer view drawer element will hide the drawer toggle icon and prevent the expand action.
  layer.view.children.length <= 1 && layer.view.classList.add('empty')
}