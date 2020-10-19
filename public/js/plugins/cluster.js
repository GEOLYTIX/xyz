document.dispatchEvent(new CustomEvent('cluster', {
  detail: _xyz => {

    _xyz.layers.plugins.cluster = layer => {

      let timer

      layer.view.appendChild(_xyz.utils.html.node `
        <div
          class="drawer panel expandable expanded"
          style="max-height: 30px;">
          <div
            class="header primary-colour"
            onclick=${e => {
              e.stopPropagation()
              _xyz.utils.toggleExpanderParent(e.target)
            }}>
            <span>Cluster</span>
            <button
              class="btn-header xyz-icon icon-expander primary-colour-filter">
          </div>
          <div style="margin-top: 12px;">
            <span>KMEANS: </span>
            <span class="bold">${layer.cluster_kmeans}</span>
            <div class="input-range">
            <input
              class="secondary-colour-bg"
              type="range"
              min=0
              value=${layer.cluster_kmeans}
              max=1
              step=0.01
              oninput=${e => {
              layer.cluster_kmeans = parseFloat(e.target.value)
              e.target.parentNode.previousElementSibling.textContent = layer.cluster_kmeans
              clearTimeout(timer)
              timer = setTimeout(() => layer.reload(), 500)
            }}>
          </div>
          <div style="margin-top: 12px;">
            <span>DBSCAN: </span>
            <span class="bold">${layer.cluster_dbscan}</span>
            <div class="input-range">
            <input
              class="secondary-colour-bg"
              type="range"
              min=0
              value=${layer.cluster_dbscan}
              max=1
              step=0.01
              oninput=${e => {
              layer.cluster_dbscan = parseFloat(e.target.value)
              e.target.parentNode.previousElementSibling.textContent = layer.cluster_dbscan
              clearTimeout(timer)
              timer = setTimeout(() => layer.reload(), 500)
            }}>`)

    }

  }
}))