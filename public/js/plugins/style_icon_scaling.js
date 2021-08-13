document.dispatchEvent(new CustomEvent('style_icon_scaling', {
  detail: detail
}))

function detail(_xyz) {

  _xyz.layers.plugins.style_icon_scaling = layer => {

    let timeout

    const panel = layer.view.appendChild(_xyz.utils.html.node `
      <div class="drawer panel expandable">
        <div
          class="header primary-colour"
          onclick=${e => {
            e.stopPropagation()
            _xyz.utils.toggleExpanderParent(e.target, true)
          }}>
          <span>Icon scaling</span>
          <button
            class="btn-header xyz-icon icon-expander primary-colour-filter">`)

    layer.style.default.scale = layer.style.default.icon?.scale || layer.style.default.scale || 1

    panel.appendChild(_xyz.utils.html.node`
      <div>
        <div style="display: grid; align-items: center;">
          <div style="grid-column: 1;">Scale</div>
          <div style="grid-column: 2;">${layer.style.default.scale}</div>
          <div
            class="input-range"
            style="grid-column: 3;">
            <input 
              type="range"
              class="secondary-colour-bg"
              min=0
              value=${layer.style.default.scale}
              max=${layer.style.default.scale + layer.style.default.scale * 3}
              step=${layer.style.default.scale / 20}
              oninput=${ e =>{
                
                layer.style.default.scale = e.target.value

                e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value

                clearTimeout(timeout)

                timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
              }}>`)

    layer.style.default.zoomInScale = layer.style.default.icon?.zoomInScale || layer.style.default.zoomInScale || 0

    panel.appendChild(_xyz.utils.html.node`
      <div>
        <div style="display: grid; align-items: center;">
          <div style="grid-column: 1;">zoomInScale</div>
          <div style="grid-column: 2;">${layer.style.default.zoomInScale}</div>
          <div
            class="input-range"
            style="grid-column: 3;">
            <input 
              type="range"
              class="secondary-colour-bg"
              min=0
              value=${layer.style.default.zoomInScale}
              max=0.3
              step=0.03
              oninput=${ e =>{
                      
                layer.style.default.zoomInScale = e.target.value
        
                e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
        
                clearTimeout(timeout)
        
                timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
              }}>`)

    layer.style.default.zoomOutScale = layer.style.default.icon?.zoomOutScale || layer.style.default.zoomOutScale || 0

    panel.appendChild(_xyz.utils.html.node`
      <div>
        <div style="display: grid; align-items: center;">
          <div style="grid-column: 1;">zoomOutScale</div>
          <div style="grid-column: 2;">${layer.style.default.zoomOutScale}</div>
          <div
            class="input-range"
            style="grid-column: 3;">
            <input 
              type="range"
              class="secondary-colour-bg"
              min=0
              value=${layer.style.default.zoomOutScale}
              max=30
              step=3
              oninput=${ e =>{
                                
                layer.style.default.zoomOutScale = e.target.value
                  
                e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
                  
                clearTimeout(timeout)
                  
                timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
              }}>`)

  }
}