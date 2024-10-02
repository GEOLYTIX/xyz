mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_zoom_to_extent: 'Zoom to filtered layer extent',
    layer_visibility: 'Toggle visibility',
    zoom_to: 'Zoom to',
  },
  de: {
    layer_zoom_to_extent: 'Zoom zum Ausmaß des gefilterten Datensatzes',
    layer_visibility: 'Umschalten der Ansicht',
    zoom_to: 'Heranzoomen',
  },
  zh: {
    layer_zoom_to_extent: '缩放至筛选图层的相应范围',
    layer_visibility: '可见性切换',
    zoom_to: '缩放至',
  },
  zh_tw: {
    layer_zoom_to_extent: '縮放至篩選圖層的相應範圍',
    layer_visibility: '可見性切換',
    zoom_to: '縮放至',
  },
  pl: {
    layer_zoom_to_extent: 'Przybliż do odfiltrowanej wastwy',
    layer_visibility: 'Zmodyfikuj widzialność',
    zoom_to: 'Przybliż do',
  },
  fr: {
    layer_zoom_to_extent: 'Zoom sur la couche filtrée',
    layer_visibility: 'Modifier la visibilité',
    zoom_to: 'Zoom sur',
  },
  ja: {
    layer_zoom_to_extent: 'フィルターされたレイヤー範囲をズームに',
    layer_visibility: '表示切替',
    zoom_to: 'ズームへ',
  },
  esp: {
    layer_zoom_to_extent: 'Zoom a capa filtrada',
    layer_visibility: 'Alternar visibilidad',
    zoom_to: 'Acercar a',
  },
  tr: {
    layer_zoom_to_extent: 'Filtrelenmis katman kapsamina yaklas',
    layer_visibility: 'Gorunurlugu degistir',
    zoom_to: 'Yaklas',
  },
  it: {
    layer_zoom_to_extent: 'Zoom sul layer',
    layer_visibility: 'Attiva/Disattiva visibilità',
    zoom_to: 'Zoom a',
  },
  th: {
    layer_zoom_to_extent: 'ซูมไปที่ขอบเขตเลเยอร์ที่กรอง',
    layer_visibility: 'สลับการมองเห็น',
    zoom_to: 'ซูมไปที่',
  },
})

export default (layer) => {

  if (layer.view === null) {

    // Do not create a layer view.
    return layer;
  }

  layer.view = mapp.utils.html.node`<div data-id=${layer.key} class="layer-view">`

  // Create content from layer view panels and plugins
  const content = Object.keys(layer)
    .map(key => mapp.ui.layers.panels[key] && mapp.ui.layers.panels[key](layer))
    .filter(panel => typeof panel !== 'undefined')

  // Set default order for panel if not explicit in layer config.
  layer.panelOrder = layer.panelOrder || ['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta']

  content.sort((a, b) => {

    // Sort according to data-id in panelOrder array.
    return layer.panelOrder.findIndex(chk => chk === a.dataset?.id)
      < layer.panelOrder.findIndex(chk => chk === b.dataset?.id)
      ? 1 : -1;
  })

  if (layer.drawer !== null) {

    layer.zoomToExtentBtn = layer.filter.zoomToExtent && mapp.utils.html`
      <button
        data-id=zoomToExtent
        title=${mapp.dictionary.layer_zoom_to_extent}
        class="mask-icon fullscreen"
        onclick=${async e => {

        // disable button if no locations were found.
        e.target.disabled = !await layer.zoomToExtent()

        layer.show()
      }}>`

    // Create layer.displayToggle button for header.
    layer.displayToggle = mapp.utils.html.node`
      <button
        data-id=display-toggle
        title=${mapp.dictionary.layer_visibility}
        class="${`mask-icon toggle ${(layer.zoomDisplay || layer.display) ? 'on' : ''}`}"
        onclick=${e => {
        const toggle = e.target.classList.toggle('on')
        toggle ? layer.show() : layer.hide()
      }}>`

    // Create a div for the magnifying glass icon
    layer.zoomBtn = layer.tables && mapp.utils.html.node`
      <button 
        data-id="zoom-to"
        title=${mapp.dictionary.zoom_to}
        class="mask-icon search"
        onclick=${() => {

        const minZoom = Object.entries(layer.tables).find(entry => !!entry[1])[0]

        const maxZoom = Object.entries(layer.tables).reverse().find(entry => !!entry[1])[0]

        const view = layer.mapview.Map.getView()

        view.getZoom() < minZoom ?
          view.setZoom(minZoom) :
          view.setZoom(maxZoom)

        layer.show()
      }}>`

    // Add on callback for toggle button.
    layer.showCallbacks.push(() => {
      layer.displayToggle.classList.add('on')
    })

    // Remove on callback for toggle button.
    layer.hideCallbacks.push(() => {
      !layer.zoomDisplay && layer.displayToggle.classList.remove('on')
    })

    const header = mapp.utils.html`
      <h2>${layer.name || layer.key}</h2>
      ${layer.zoomToExtentBtn}
      ${layer.displayToggle}
      ${layer.zoomBtn}
      <div class="mask-icon expander"></div>`

    // Create layer drawer node.
    layer.drawer = mapp.ui.elements.drawer({
      data_id: `layer-drawer`,
      class: `layer-view raised ${layer.classList || ''} ${content.length ? '' : 'empty'}`,
      header: header,
      content: content
    })

    // Render layer.drawer into layer.view
    mapp.utils.render(layer.view, layer.drawer)

  } else {

    // Append elements directly to layer.view
    content.forEach(el => layer.view.append(el))
  }

  // The layer may be zoom level restricted.
  layer.tables && layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

    if (!layer.tableCurrent()) {

      layer.zoomBtn.style.display = 'block'

      // Collapse drawer and disable layer.view.
      layer.view.querySelector('[data-id=layer-drawer]').classList.remove('expanded')

      // Disable layer display toggle.
      layer.displayToggle.classList.add('disabled')

      // Disable layer.view content.
      content.forEach(el => el.classList.add('disabled'))

    } else {

      layer.zoomBtn.style.display = 'none'

      // Enable layer display toggle.
      layer.displayToggle.classList.remove('disabled')

      // Enable layer.view content.
      content.forEach(el => el.classList.remove('disabled'))
    }

  })

  return layer
}