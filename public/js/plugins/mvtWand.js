export default (function() {

  mapp.ui.layers.panels.mvtWand = layer => {

    // Find tabview element from data-id attribute.
    const tabview = document.querySelector(`[data-id=${layer.mvtWand.tabview}]`)

    // Return if the named tabview is not found in document.
    if (!tabview) return;

    layer.mvtWand.selection = new Set()

    const locationStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(49,27,146,0.8)',
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'rgba(94,53,177,0.4)'
      })
    })

    layer.mvtWand.L = new ol.layer.VectorTile({
      key: `${layer.key}_clone`,
      source: layer.L.getSource(),
      style: feature => {
        let id = feature.get('id')
        if(layer.mvtWand.selection.has(id)) {
          return locationStyle
        }
      }
    })

    layer.mapview.Map.addLayer(layer.mvtWand.L)

    // The select button
    const btn_select = mapp.utils.html.node`
    <button
      class="flat bold wide primary-colour"
      onclick=${click}>Select with a wand`

    return btn_select

    function click(e) {

      e.target.classList.toggle('active')

      if (!e.target.classList.contains('active')) {
        layer.mapview.interactions.highlight()
        return
      }

      createTabAndShow()

      layer.show()

      layer.mapview.interactions.highlight({
        layerFilter: (featureLayer) => layer.L === featureLayer,
        getLocation: (feature) => {  

          layer.mvtWand.selection.has(feature.id)
            && layer.mvtWand.selection.delete(feature.id)
            || layer.mvtWand.selection.add(feature.id)
          
          layer.mvtWand.L.changed()

          let idArr = Array.from(layer.mvtWand.selection)

          if (!idArr.length) {
            layer.mvtWand.remove()
            return;
          }

          layer.mvtWand.show()
          layer.mvtWand.queryparams.ids = idArr.join(',')
          layer.mvtWand.update()
        }
      });
    }

    function createTabAndShow() {

      if (layer.mvtWand.show) return layer.mvtWand.show()

      mapp.ui.Dataview(layer.mvtWand)
        .then(() => layer.mvtWand.show())

      // Pass layer.mvtWand as detail to the tabview.
      // layer.mvtWand becomes a tab.
      tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: layer.mvtWand
      }))

      layer.tabs ?
        layer.tabs.push(layer.mvtWand) :
        layer.tabs = [layer.mvtWand];

    }
  
  }

})()