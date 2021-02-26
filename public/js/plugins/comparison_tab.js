document.dispatchEvent(new CustomEvent('comparison_tab', {
  detail: _xyz => {

    _xyz.layers.plugins.comparison_tab = layer => {

      const target = _xyz.utils.html.node`<div>Locations`

      layer.comparison_tab = {
        title: 'Comparison',
        display: true,
        target: target,
        layer: layer
      }

      _xyz.tabview.add(layer.comparison_tab)

      layer.display && layer.comparison_tab.show()

    }

  }
}))