document.dispatchEvent(new CustomEvent('magicWand', {
  detail: _xyz => {

    _xyz.layers.plugins.magicWand = layer => {

        if(layer.format !== 'mvt') return // for mvt format only

        const selectedCountry = new ol.style.Style({ // selection style
          stroke: new ol.style.Stroke({
            color: 'rgba(200,20,20,0.8)',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: 'rgba(200,20,20,0.4)'
          })
        })

        layer.selectionLayer = new ol.layer.VectorTile({ // selection layer
          map: _xyz.map,
          source: layer.L.getSource(),
          style: feature => {
            let id = feature.get('id')
            if(layer.selection.has(id)) return selectedCountry
          }
        })

        layer.selection = new Set() 

        function magicWand(e) {

          _xyz.mapview.node.style.cursor = 'pointer'
              
          layer.L.getFeatures(e.pixel).then(features => {

            if(!features) return

            const feature = features[0]

            if(!feature) return

            const id = feature.get('id')

            layer.selection.has(id) ? layer.selection.delete(id) : layer.selection.add(id)

            layer.selectionLayer.changed()
            
          }) 

          _xyz.mapview.node.addEventListener('contextmenu', finishMagicWand, {once: true})

        }

        function finishMagicWand(e) { // this is on contextmenu
          e.preventDefault()
          _xyz.map.un('singleclick', magicWand)
          layer.magicWandBtn.classList.remove('active') 
          _xyz.mapview.interaction.highlight.begin()
        }

        layer.view.appendChild(_xyz.utils.html.node`
        <button
          class="btn-wide primary-colour"
          onclick=${async e => {

            e.stopPropagation()
            
            layer.magicWandBtn = e.target

            //layer.selection = new Set() // clears selection when started
            
            if (layer.magicWandBtn.classList.contains('active')) {
              
              layer.magicWandBtn.classList.remove('active') 
              _xyz.map.un('singleclick', magicWand) // remove magic wand event
              _xyz.map.removeLayer(layer.selectionLayer) // remove selection layer
              _xyz.mapview.interaction.highlight.begin() // put back interaction
              
              return
            }

            layer.magicWandBtn.classList.add('active')      

            layer.show() 

            layer.bringToFront()   

             _xyz.mapview.interaction.current
             && _xyz.mapview.interaction.current.finish
             && _xyz.mapview.interaction.current.finish()


            _xyz.map.on('singleclick', magicWand)


          }}>Select with Magic Wand`)

    }
  }
}))