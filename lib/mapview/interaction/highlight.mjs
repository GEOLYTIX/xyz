export default _xyz => {

  const highlight = {

    begin: begin,

    finish: finish

  }

  return highlight


  function begin() {

    _xyz.mapview.interaction.current
      && _xyz.mapview.interaction.current.finish
      && _xyz.mapview.interaction.current.finish()

    _xyz.mapview.interaction.current = highlight

    _xyz.mapview.node.style.cursor = 'auto'

    _xyz.map.on('pointermove', pointerMove)
    _xyz.mapview.node.addEventListener('mouseout', mouseOut)

    _xyz.map.on('singleclick', singleClick)
    _xyz.mapview.node.addEventListener('mousedown', mouseDown)

  }

  function mouseDown(){
    clearTimeout(highlight.timeout)
    highlight.timeout = setTimeout(()=>{
      highlight.longClick = true
      _xyz.mapview.node.style.cursor = "url('data:image/svg+xml,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20stroke%3D%22%23fff%22%20stroke-width%3D%223%22%20fill%3D%22none%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%2210%22%20stroke%3D%22%23333%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E') 12 12, auto"
    }, 600)
  }

  function mouseOut() {
    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    }
    clear()
  }

  function pointerMove(e) {

    // pointermove undoes long click
    if (highlight.longClick) {
      delete highlight.longClick
      _xyz.mapview.node.style.cursor = 'auto'
    }

    _xyz.mapview.pointerLocation = {
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    }

    clearTimeout(highlight.timeout)

    _xyz.mapview.infotip.node && _xyz.mapview.infotip.position()

      // Iterate through all features (with layer) at pixel
    const candidate = _xyz.map.forEachFeatureAtPixel(e.pixel,
      (feature, featureLayer) => ({
        feature: feature,
        featureLayer: featureLayer
      }),
      {
        // Filter for layers which have a highlight style.
        layerFilter: featureLayer => Object.values(_xyz.layers.list)
            .some(layer => layer.display && layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer),
        hitTolerance: 5,
      })

    if (!candidate) return clear()

    if (highlight.layer === candidate.featureLayer.get('layer')
      && highlight.layer.highlight === candidate.feature.get('id')) return;


    if (highlight.layer !==  candidate.featureLayer.get('layer')) clear()

    highlight.timeout = setTimeout(()=>{

      highlight.feature = candidate.feature
      highlight.layer = candidate.featureLayer.get('layer')
      highlight.layer.highlight = candidate.feature.get('id')
      
      if(highlight.layer.infoj) _xyz.mapview.node.style.cursor = 'pointer'
      
      // Redraw layer to style highlight.
      if (e.originalEvent.pointerType !== 'touch') {

        highlight.layer.style.highlight && highlight.layer.L.changed()

        highlight.layer.hover && highlight.layer.infotip()
      }

    }, 100)

  }

  function clear() {

    _xyz.mapview.infotip.node && _xyz.mapview.infotip.node.remove()

    if (!highlight.layer) return

    delete highlight.feature
    delete highlight.layer.highlight

    _xyz.mapview.node.style.cursor = 'auto'

    highlight.layer.style.highlight && highlight.layer.L.changed()

    delete highlight.layer
  }

  function singleClick(e) {

    if (highlight.longClick) {
      delete highlight.longClick
      _xyz.mapview.node.style.cursor = 'auto'
      return drillDown(e)
    }
    clearTimeout(highlight.timeout)

    if (e.originalEvent.pointerType === 'touch') pointerMove(e)

    if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay)

    if (!highlight.layer) return

    const pixel = e.pixel

    highlight.layer.select(highlight.feature, pixel)
  }

  function drillDown(e) {

    clear()

    _xyz.map.forEachFeatureAtPixel(e.pixel, (feature, featureLayer) => {

      featureLayer.get('layer').select(feature)

    },
    {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.infoj && layer.style && layer.style.highlight && layer.L === featureLayer
        })
      },
      hitTolerance: 5,
    })
  }

  function finish() {
    _xyz.map.un('pointermove', pointerMove)
    _xyz.map.un('singleclick', singleClick)
    _xyz.mapview.node.removeEventListener('mouseout', mouseOut)
    _xyz.mapview.node.removeEventListener('mousedown', mouseDown)
  }

}