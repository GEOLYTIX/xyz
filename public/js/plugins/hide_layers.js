document.dispatchEvent(new CustomEvent('hide_layers', {
  detail: _xyz => {

      if(!document.getElementById('mapButton')) return

      document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
      <button
        class="mobile-display-none"
          title="Hide layer views which aren't displayed in the map view in the layer list view."
          onclick=${e => {

            if (e.target.classList.contains('enabled')) {

              e.target.classList.remove('enabled')
              Object.values(_xyz.layers.list).forEach(layer => {

                layer.view.style.display = 'block'
  
              })
              return;

            }

            e.target.classList.add('enabled')

            Object.values(_xyz.layers.list).forEach(layer => {

              if (!layer.display) layer.view.style.display = 'none'

            })

          }}><div class="xyz-icon icon-receipt">`)

  }
}))