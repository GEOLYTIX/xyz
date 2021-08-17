document.dispatchEvent(new CustomEvent('cluster', {
  detail: detail
}))

function detail(_xyz) {

  _xyz.layers.plugins.cluster = layer => {

    let timeout

    const panel = layer.view.appendChild(_xyz.utils.html.node `
      <div class="drawer panel expandable">
        <div
          class="header primary-colour"
          onclick=${e => {
            e.stopPropagation()
            _xyz.utils.toggleExpanderParent(e.target, true)
          }}>
          <span>Cluster</span>
          <button
            class="btn-header xyz-icon icon-expander primary-colour-filter">`)


      layer.cluster_kmeans && panel.appendChild(_xyz.utils.html.node`
      <div>
        <div style="display: grid; align-items: center;">
          <div
            title="The minimum number of cluster in the viewport."
            style="grid-column: 1;">kMeans</div>
          <div style="grid-column: 2;">${parseInt(1 / layer.cluster_kmeans)}</div>
          <div
            class="input-range"
            style="grid-column: 3;">
            <input 
              type="range"
              class="secondary-colour-bg"
              min=0
              value=${parseInt(1 / layer.cluster_kmeans)}
              max=100
              step=1
              oninput=${ e =>{
                        
                layer.cluster_kmeans = 1 / e.target.value
        
                e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value
        
                clearTimeout(timeout)
        
                timeout = setTimeout(() => layer.reload(), 400)
              }}>`)          

    layer.style.cluster.clusterScale = layer.style.cluster.icon?.clusterScale || layer.style.cluster.clusterScale || 2

    panel.appendChild(_xyz.utils.html.node`
      <div>
        <div style="display: grid; align-items: center;">
          <div 
            title="Scale applied in addition to the base scale of the largest cluster icon."
            style="grid-column: 1;">Scale</div>
          <div style="grid-column: 2;">${layer.style.default.scale}</div>
          <div
            class="input-range"
            style="grid-column: 3;">
            <input 
              type="range"
              class="secondary-colour-bg"
              min=0
              value=${layer.style.cluster.clusterScale}
              max=${layer.style.cluster.clusterScale + layer.style.cluster.clusterScale * 3}
              step=${layer.style.cluster.clusterScale / 20}
              oninput=${ e =>{
                
                layer.style.cluster.clusterScale = e.target.value

                e.target.parentNode.previousSibling.previousSibling.textContent = e.target.value

                clearTimeout(timeout)

                timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
              }}>`)


  }
}