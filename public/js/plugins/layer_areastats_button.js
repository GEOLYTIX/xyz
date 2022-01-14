
document.dispatchEvent(new CustomEvent('layer_areastats_button', {
  detail: _xyz => {

    _xyz.layers.plugins.layer_areastats_button = layer => {

      document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
      <button
      class="mobile-display-none"
        title="Add area stats polygon"
        onclick=${e => {

          e.stopPropagation()

          const btn = e.target
      
          if (btn.classList.contains('enabled')) return _xyz.mapview.interaction.draw.cancel()
      
          btn.classList.add('enabled')
          layer.show()
          layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg')
      
          _xyz.mapview.interaction.draw.begin({
            layer: layer,
            type: 'Polygon',
            //geometryFunction: _xyz.mapview.interaction.draw.polygonKinks,
            tooltip: layer.edit.polygon.tooltip,
            callback: () => {
              layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg')
              btn.classList.remove('enabled')
            }
          })
        }}><div class="xyz-icon icon-maps-ugc off-black-filter">`)   

    }

  }
}))