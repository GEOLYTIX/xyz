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

                //layer.view.style.display = 'block'
                layer.view.style.visibility = 'visible'
                layer.view.style.height = 'auto'
  
              })

              Object.values(_xyz.layers.listview.groups).forEach(group => {
  
                group.drawer.style.visibility = 'visible'
                group.drawer.style.height = 'auto'
  
              })
              return;

            }

            e.target.classList.add('enabled')

            Object.values(_xyz.layers.list).forEach(layer => {

              if (!layer.display) {
                layer.view.style.visibility = 'hidden'
                layer.view.style.height = '0'
              }

            })

            Object.values(_xyz.layers.listview.groups).forEach(group => {

              if (group.list.some(layerInGroup => layerInGroup.display)) return;

              group.drawer.style.visibility = 'hidden'
              group.drawer.style.height = '0'

            })

          }}><div class="xyz-icon icon-receipt">`)

  }
}))