import style from './style/_styles.mjs'

import filter from './filter/_filter.mjs'

import draw from './draw/_draw.mjs'

import data from './data.mjs'

import report from './report.mjs'

import download from './download.mjs';

export default _xyz => {

  const view = {

    create: create,

    style: style(_xyz),

    filter: filter(_xyz),

    draw: draw(_xyz),

    report: report(_xyz),

    data: data(_xyz),

    download: download(_xyz)

  }

  return view

  
  function create(layer) {

    layer.view = _xyz.utils.html.node`<div class="drawer layer-view">`
   
    const header = _xyz.utils.html.node`
    <div class="header enabled"><span>${layer.name || layer.key}`
  
    // Add symbol to layer header.
    if (layer.style.default && layer.style.default.showInHeader) {
    
      header.appendChild(_xyz.utils.html.node`
      <img
        class="btn-header"
        title=${_xyz.language.layer_default_icon}
        style="float: right; cursor: help;"
        src="${_xyz.utils.svg_symbols(layer.style.default)}">`)
    }
  
    header.appendChild(_xyz.utils.html.node`
    <button
      title=${_xyz.language.layer_zoom_to_extent}
      class="btn-header xyz-icon icon-fullscreen"
      onclick=${e=>{
        e.stopPropagation()
        layer.zoomToExtent()
      }}>`)
   
    const toggleDisplay = _xyz.utils.html.node`
    <button
      title=${_xyz.language.layer_visibility}
      class="${'btn-header xyz-icon icon-toggle ' + (layer.display && 'on')}"
      onclick=${e=>{
        e.stopPropagation()
        layer.display ? layer.remove() : layer.show()
      }}>`
  
    header.appendChild(toggleDisplay)

    layer.view.addEventListener('toggleDisplay', () => {
      toggleDisplay.classList.toggle('on')
    })

    layer.view.appendChild(header)

    // Append meta to layer view panel.
    if (layer.meta) {
      const meta = _xyz.utils.html.node`<p class="meta">`
      meta.innerHTML = layer.meta
      layer.view.appendChild(meta)
    }

    // Create & add Style panel.
    const style_panel = view.style.panel(layer)
    style_panel && layer.view.appendChild(style_panel)

    // Create & add Filter panel.
    const filter_panel = view.filter.panel(layer)
    filter_panel && layer.view.appendChild(filter_panel)

    // Create & add Dataviews panel.
    const data_panel = view.data.panel(layer)
    data_panel && layer.view.appendChild(data_panel)

    // Create & add Draw panel.
    const draw_panel = view.draw.panel(layer)
    draw_panel && layer.view.appendChild(draw_panel)
        
    // Create & add Reports panel.
    const report_panel = view.report.panel(layer)
    report_panel && layer.view.appendChild(report_panel)

    const download_panel = view.download.panel(layer);
    download_panel && layer.view.appendChild(download_panel)

    // _xyz.layers.modules && layer.modules && layer.modules.forEach(_module => {
    //   _xyz.locale.modules[_module](layer)
    // })

    if (layer.view.children.length <= 1) return

    // Make the layer view panel expandable if it contains children.
    layer.view.classList.add('expandable')

    // Expander control for layer drawer.
    header.onclick = e => {
      e.stopPropagation()
      _xyz.utils.toggleExpanderParent(e.target, true)
    }

    // Add the expander toggle to the layer view header.
    header.appendChild(_xyz.utils.html.node`
    <button
      title=${_xyz.language.layer_toggle_dashboard}
      class="btn-header xyz-icon icon-expander"
      onclick=${e=>{
        e.stopPropagation()
        _xyz.utils.toggleExpanderParent(e.target)
      }}>`)

    // Expand the first panel in the layer view.
    const firstPanel = layer.view.querySelector('.panel')

    firstPanel && firstPanel.classList.add('expanded')

  }

}