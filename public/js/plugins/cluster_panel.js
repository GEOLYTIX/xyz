export default (function(){

  mapp.ui.layers.panels.cluster_panel = layer => {

    let timeout

    const elements = []

    layer.cluster_kmeans && layer.cluster_panel.kmeans && elements.push(mapp.ui.elements.slider({
      label: layer.cluster_panel.kmeans_desc || 'Minimum number of cluster as defined by the nearest mean (kmean).',
      min: 0,
      max: 100,
      val: parseInt(1 / layer.cluster_kmeans),
      callback: e => {
        layer.cluster_kmeans = isFinite(1 / e.target.value) && (1 / e.target.value) || 0
        checkGridStatus()
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 400)
      }
    }))

    layer.cluster_dbscan && layer.cluster_panel.dbscan && elements.push(mapp.ui.elements.slider({
      label: layer.cluster_panel.dbscan_desc || 'Maximum distance between locations in a cluster as a fraction of the viewport.',
      min: 0,
      max: 100,
      val: parseInt(0.5 / layer.cluster_dbscan),
      callback: e => {
        layer.cluster_dbscan = isFinite(0.5 / e.target.value) && (0.5 / e.target.value) || 0
        checkGridStatus()
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 400)
      }
    }))

    layer.cluster_panel.resolution && elements.push(mapp.ui.elements.slider({
      label: typeof layer.cluster_panel.resolution === 'string' && layer.cluster_panel.resolution || 'Resolution',
      title: 'Cluster grid resolution.',
      data_id: 'resolution',
      min: 1,
      max: 100,
      val: parseInt(1 / layer.cluster_resolution),
      callback: e => {
        layer.cluster_resolution = isFinite(1 / e.target.value) && (1 / e.target.value) || 0

        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 400)
      }
    }))

    layer.cluster_panel.hexgrid && elements.push(mapp.ui.elements.chkbox({
      label: 'Use Hex Grid',
      data_id: 'hexgrid',
      checked: !!layer.cluster_hexgrid,
      onchange: (checked) => {
        layer.cluster_hexgrid = checked
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 400)
      }
    }));

    layer.style.cluster.clusterScale = layer.style.cluster.icon?.clusterScale || layer.style.cluster.clusterScale || 2

    layer.cluster_panel.icon_scale && elements.push(mapp.ui.elements.slider({
      label: 'Cluster Icon Scale',
      title: 'Scale applied in addition to the base scale of the largest cluster icon.',
      min: 0,
      max: layer.style.cluster.clusterScale + layer.style.cluster.clusterScale * 3,
      val: layer.style.cluster.clusterScale,
      callback: e => {
        layer.style.cluster.clusterScale = parseFloat(e.target.value)
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.L.setStyle(layer.L.getStyle()), 400)
      }
    }))

    layer.cluster_panel.log_scale && elements.push(mapp.ui.elements.chkbox({
      label: 'Use Log Scale',
      checked: !!layer.style.logScale,
      onchange: (checked) => {
        layer.style.logScale = checked
        clearTimeout(timeout)
        timeout = setTimeout(() => layer.reload(), 400)
      }
    }));

    const drawer = mapp.ui.elements.drawer({
      data_id: 'cluster-drawer',
      class: 'raised',
      header: mapp.utils.html`
        <h3>Cluster</h3>
        <div class="mask-icon expander"></div>`,
      content: mapp.utils.html`${elements}`
    });

    function checkGridStatus() {

      let res_slider = drawer.querySelector("[data-id=resolution]")
      let hex_chk = drawer.querySelector("[data-id=hexgrid]")

      if (layer.cluster_kmeans > 0 || layer.cluster_dbscan > 0) {
        res_slider && res_slider.classList.add('disabled')
        hex_chk && hex_chk.classList.add('disabled')
      } else {
        res_slider && res_slider.classList.remove('disabled')
        hex_chk && hex_chk.classList.remove('disabled')
      }

    }
    checkGridStatus()

    return drawer
  }

})()