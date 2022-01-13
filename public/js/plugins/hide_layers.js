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

                layer.view?.style.removeProperty('visibility');
                layer.view?.style.removeProperty('height');
                layer.view?.style.removeProperty('border-top');
  
              })

              Object.values(_xyz.layers.listview.groups).forEach(group => {
  
                layer.view?.style.removeProperty('visibility');
                layer.view?.style.removeProperty('height');
                layer.view?.style.removeProperty('border-top');
  
              })
              return;

            }

            e.target.classList.add('enabled')

            Object.values(_xyz.layers.list).forEach(layer => {

              if (layer.view?.classList.contains('disabled')) {
                layer.remove()
              }

              if (!layer.display && layer.view) {
                layer.view.style.visibility = 'hidden'
                layer.view.style.height = '0'
                layer.view.style.borderTop = 'none'
              }

            })

            Object.values(_xyz.layers.listview.groups).forEach(group => {

              if (group.list.some(layerInGroup => layerInGroup.display)) return;

              group.drawer.style.visibility = 'hidden'
              group.drawer.style.height = '0'
              group.view.style.borderTop = 'none'

            })

          }}><div class="xyz-icon icon-receipt">`)

  }
}))