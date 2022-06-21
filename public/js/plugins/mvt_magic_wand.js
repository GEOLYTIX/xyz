export default (() => {

	mapp.ui.layers.panels.mvtMagicWand = layer => {
		
		if(layer.format !== 'mvt') return

		const selectedCountry = new ol.style.Style({ // selection style
          stroke: new ol.style.Stroke({
            color: 'rgba(200,20,20,0.8)',
            width: 2
          }),
          fill: new ol.style.Fill({
            color: 'rgba(200,20,20,0.4)'
          })
        })

        layer.mvtMagicWand.L = new ol.layer.VectorTile({ // selection layer
          key: `selectionLayer_${layer.key}`,
          map: layer.mapview.Map,
          source: layer.L.getSource(),
          style: feature => {
            let id = feature.get('id')
            if(layer.mvtMagicWand.selection.has(id)) return selectedCountry
          }
        })

        layer.mvtMagicWand.selection = new Set()


        function magicWand(e) {

        	layer.mapview.Map.getTargetElement().style.cursor = 'pointer'

        	layer.L.getFeatures(e.pixel).then(features => {

        		if(!features) return

        		const feature = features[0]

        	    if(!feature) return

        	    const id = feature.get('id')

        	    layer.mvtMagicWand.selection.has(id) ? layer.mvtMagicWand.selection.delete(id) : layer.mvtMagicWand.selection.add(id)

        	    layer.mvtMagicWand.L.changed()

        	})

        	layer.mapview.Map.getTargetElement().addEventListener('contextmenu', finishMagicWand, {once: true})
        }

        function finishMagicWand(e){ // this is on contextmenu
        	e.preventDefault()
        	layer.mapview.Map.un('singleclick', magicWand)
        	layer.mvtMagicWand.btn.classList.remove('active') 
        	layer.mapview.interactions.highlight() // put back interaction
        }

        layer.mvtMagicWand.btn = mapp.utils.html.node`
        <button class="flat bold wide primary-colour"
        onclick=${async e => {
        	e.stopPropagation()

        	//layer.mvtMagicWand.selection = new Set() // clears selection when started

        	if (layer.mvtMagicWand.btn.classList.contains('active')) {
        		layer.mvtMagicWand.btn.classList.remove('active') 
        		layer.mapview.Map.un('singleclick', magicWand) // remove magic wand event
        		layer.mapview.interactions.highlight() // put back interaction
        		return
        	}

        	layer.mvtMagicWand.btn.classList.add('active')   

        	layer.show() 

        	//layer.bringToFront() // awaits method

        	layer.mapview.interaction?.finish()

        	layer.mapview.Map.on('singleclick', magicWand)

        }}>Select with Magic Wand`

        return layer.mvtMagicWand.btn
	
	}

})()