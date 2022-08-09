export default (function() {

  mapp.ui.layers.panels.mvt_select_tab = layer => {

    // Find tabview element from data-id attribute.
    const tabview = document.querySelector(`[data-id=${layer.mvt_select_tab.tabview}]`)

    // Return if the named tabview is not found in document.
    if (!tabview) return;

    layer.mvt_select_tab.title = layer.mvt_select_tab.title || 'MVT Selection'

    // Set to store ids of selected locations.
    layer.mvt_select_tab.selection = new Set()

    // Create OL style from style, or create default style.
    layer.mvt_select_tab.Style = mapp.utils
      .style(layer.mvt_select_tab.style || {
        strokeColor: '#311b92cc',
        strokeWidth: 2,
        fillColor: '#5e35b166',
        fillOpacity: 0.5
      })
    
    // Create clone of mvt layer.
    layer.mvt_select_tab.L = new ol.layer.VectorTile({
      key: `${layer.key}_clone`,
      source: layer.L.getSource(),
      style: feature => {

        // Return style if set has feature ID 
        if(layer.mvt_select_tab.selection.has(feature.get('id'))) {
          return layer.mvt_select_tab.Style
        }

        // ...otherwise the location will not be rendered.
      }
    })

    layer.mapview.Map.addLayer(layer.mvt_select_tab.L)

    layer.mvt_select_tab.chkBox = mapp.ui.elements.chkbox({
      label: layer.mvt_select_tab.title,
      checked: !!layer.mvt_select_tab.display,
      onchange: (checked) => {
  
        layer.mvt_select_tab.display = checked

        // Show or remove tab according to the checked/display value.
        layer.mvt_select_tab.display ?
          createTabAndShow() :
          layer.mvt_select_tab.remove()
    
      }
    })

    layer.mvt_select_tab.btn = mapp.utils.html.node`
      <button
          class="flat bold wide primary-colour"
          onclick=${click}>Select with a wand`

    // Return control to layer view
    return mapp.utils.html.node`
      ${layer.mvt_select_tab.chkBox}
      ${layer.mvt_select_tab.btn}`

    function click(e) {

      e.target.classList.toggle('active')

      if (!e.target.classList.contains('active')) {
        cancel()
        return
      }

      // Custom highlight interaction.
      layer.mapview.interactions.highlight({

        // Set filter to the layer
        layerFilter: (featureLayer) => layer.L === featureLayer,

        // Get location feature from interaction.
        getLocation: (feature) => {  

          // Check whether ID is in set and either delete or add ID.
          layer.mvt_select_tab.selection.has(feature.id)
            && layer.mvt_select_tab.selection.delete(feature.id)
            || layer.mvt_select_tab.selection.add(feature.id)
          
          // Redraw the layer.
          layer.mvt_select_tab.L.changed()

          if (!layer.mvt_select_tab.popup) {
            update()
            return
          }
       
          // Set context menu popup on last vertex.
          layer.mapview.popup({
            content: mapp.utils.html.node`<ul>
              <li onclick=${update}>Update</li>
              <li onclick=${cancel}>Cancel</li>`,
          })

        }
      });
    }

    function update() {

      // Create array from ID set.
      let idArr = Array.from(layer.mvt_select_tab.selection)

      // Remove tab if array / set is empty.
      if (!idArr.length) {
        layer.mvt_select_tab.remove()
        return;
      }

      createTabAndShow()

      // Add ID array to queryparams.
      layer.mvt_select_tab.queryparams.ids = idArr.join(',')

      // Update table from query with ID as queryparams array.
      layer.mvt_select_tab.update()

      // Cancel interaction after dataview update.
      if (layer.mvt_select_tab.popup) cancel()
    }

    function cancel() {

      // Remove active state on button.
      layer.mvt_select_tab.btn.classList.remove('active')

      // Remove popup.
      layer.mapview.popup(null)

      // Reset default highlight interaction.
      layer.mapview.interactions.highlight()
    }

    function createTabAndShow() {

      // Show the layer with the tab.
      layer.show()

      // Show the tab if already created.
      if (layer.mvt_select_tab.show) return layer.mvt_select_tab.show()

      // Create the dataview async and then show.
      mapp.ui.Dataview(layer.mvt_select_tab)
        .then(() => layer.mvt_select_tab.show())

      // Pass layer.mvt_select_tab as detail to the tabview.
      // layer.mvt_select_tab becomes a tab.
      tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: layer.mvt_select_tab
      }))

    }
  
  }

})()