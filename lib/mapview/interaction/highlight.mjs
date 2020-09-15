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

    highlight.featureSet = new Set()

    _xyz.map.on('pointermove', pointermove)
    _xyz.mapview.node.addEventListener('mouseout', mouseOut)

    _xyz.map.on('singleclick', singleclick)

  }

  function mouseOut() {
    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    }
    clear()
  }

  function pointermove(e) {

    _xyz.mapview.pointerLocation = {
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY
    }

    _xyz.mapview.infotip.node && _xyz.mapview.infotip.position()

    const featureSet = new Set()

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(e.pixel, (feature, featureLayer) => {

      // Add feature to current set.
      featureSet.add(feature)

      if (highlight.featureSet.has(feature)) return

      // Set highlight layer / feature.
      highlight.feature = feature
      highlight.layer = featureLayer.get('layer')
      highlight.layer.highlight = feature.get('id')

      if(highlight.layer.infoj) _xyz.mapview.node.style.cursor = 'pointer'

      // Redraw layer to style highlight.
      if (e.originalEvent.pointerType !== 'touch') highlight.layer.L.setStyle(
        highlight.layer.L.getStyle()
      )

      // Check for hover.
      e.originalEvent.pointerType !== 'touch'
        && highlight.layer.hover
        && highlight.layer.hover.field
        && highlight.layer.infotip()

    },
    {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer
        })
      },
      hitTolerance: 5,
    })

    // Assign current set to highlight object.
    highlight.featureSet = featureSet

    // Clear if current set is empty or highlighted feature is not in current set.
    if (!featureSet.size || !featureSet.has(highlight.feature)) clear()
  }

  function clear() {

    highlight.featureSet = new Set()

    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.node.remove()

    if (!highlight.layer) return

    highlight.layer.highlight = true
    _xyz.mapview.node.style.cursor = 'auto'
    highlight.layer.L.setStyle(highlight.layer.L.getStyle())

    delete highlight.layer
    delete highlight.feature
  }

  function singleclick(e) {

    if (e.originalEvent.pointerType === 'touch') pointermove(e)

    if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay)

    if (!highlight.layer) return

    if (!highlight.feature) return

    highlight.layer.select(highlight.feature)
  }

  function finish() {
    _xyz.map.un('pointermove', pointermove)
    _xyz.map.un('singleclick', singleclick)
    _xyz.mapview.node.removeEventListener('mouseout', mouseOut)
  }

}