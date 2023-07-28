export default function(params){

  const mapview = this;

  // Finish the current interaction.
  mapview.interaction?.finish()  

  mapview.interaction = Object.assign({

    mapview: this,

    type: 'highlight',

    finish,

    clear,

    highlight,

    getFeature,

    hitTolerance: 5,

    candidates: {},

    candidateKeys: new Set(),

    locations: new Set(),

    longClickMethod: mapview.allFeatures,

    longClickMS: 500,

    // Filter for layers which have a highlight style.
    layerFilter: L => Object.values(this.layers)

      // layer L matching the feature layer L must have a qID defined
      .some(layer => layer.qID && layer.L === L)

  }, params)

  // Set mapview.interaction to be the current mapview mapview.interaction.
  mapview.interaction = mapview.interaction

  // pointerMove will highlight features.
  mapview.Map.on('pointermove', pointerMove)

  // click will select the highlighted feature.
  mapview.Map.on('click', click)

  mapview.Map.getTargetElement().addEventListener('mousedown', mouseDown)

  mapview.Map.getTargetElement().addEventListener('touchstart', touchStart)

  mapview.Map.getTargetElement().addEventListener('mouseup', mouseUp)

  // Prevent mouseDown event on touch input.
  function touchStart(e) {
    e.preventDefault()
  }

  function mouseDown(){

    // Short circuit the mouseDown event method if the longClickMethod is falsy.
    if (!mapview.interaction.longClickMethod) return;

    // Remove longClick flag.
    delete mapview.interaction.longClick

    // Clear longClick timeout.
    clearTimeout(mapview.interaction.longClickTimeout)

    // Set longClick timeout.
    mapview.interaction.longClickTimeout = setTimeout(

      // Set longClick flag.
      () => {
        mapview.interaction.longClick = true
        mapview.Map.getTargetElement().style.cursor = 'wait'
      },
      
      // 1000ms default timeout for longclick.
      mapview.interaction.longClickMS)
  }

  function mouseUp(){
    mapview.Map.getTargetElement().style.cursor = 'auto'
  }

  let shortCircuit

  function pointerMove(e) {

    // A popup is open.
    if (mapview.popup()) return;

    // Clear longClick timeout.
    clearTimeout(mapview.interaction.longClickTimeout)

    // Method should short circuit if still processing.
    if (shortCircuit) return;

    // Set shortCircuit flag.
    shortCircuit = true;

    let candidates = {};

    mapview.Map.forEachFeatureAtPixel(e.pixel,
      (F, L) => {

        // Create candidate object.
        let candidate = {
          key: `${L.get('key') || ol.util.getUid(L)}!${F.get('id') || F.getId() || ol.util.getUid(F)}`,
          F, L
        }

        // Assign to key in candidates object.
        candidates[candidate.key] = candidate
      },
      {
        layerFilter: mapview.interaction.layerFilter,
        hitTolerance: mapview.interaction.hitTolerance,
      })

    // No features at pixel.
    if (!Object.keys(candidates).length) {

      // Reset candidateKeys
      mapview.interaction.candidateKeys = new Set();

      // Remove shortCircuit flag.
      shortCircuit = false;

      // Clear highlight.
      clear();

      // There is nothing to highlight.
      return;
    }

    // Check whether set of candidate keys is equal to mapview.interaction.candidateKeys
    if (mapp.utils.areSetsEqual(mapview.interaction.candidateKeys, new Set(Object.keys(candidates)))) {

      // Remove shortCircuit flag
      shortCircuit = false;

      // The highlight hasn't changed.
      return;
    }

    // Find candidate from key which is not in candidates set.
    let candidate = candidates[Object.keys(candidates).find(key => !mapview.interaction.candidateKeys.has(key))]

    // Assign candidate from first key if candidate is falsy.
    candidate = candidate
      || mapview.interaction.current?.key && candidates[mapview.interaction.current?.key]
      || candidates[Object.keys(candidates)[0]]

    // Assign new Set of candidate keys to mapview.interaction.
    mapview.interaction.candidateKeys = new Set(Object.keys(candidates))

    // Remove shortCircuit flag.
    shortCircuit = false;

    // Call highlight method.
    mapview.interaction.highlight(candidate, e)
  }

  function highlight(feature, e) {

    // Highlight method should only be called if the highlight has changed.
    clear()

    // Assign the layer and ID to the candidate object.
    mapview.interaction.current = Object.assign(feature, {
      layer: mapview.layers[feature.L.get('key')],
      id: feature.F.get('id') || feature.F.getId()
    })

    // Assign the id to the layer highlight key.
    // Required to determine in the style function whether the current feature should be styled as highlighted.
    mapview.interaction.current.layer.highlight = feature.id

    // Touch events should not highlight features since there is no cursor.
    if (e.originalEvent.pointerType !== 'mouse') {

      // Don't get location from touch pan or zoom pinch event.
      e.type !== 'pointermove' && mapview.interaction.getFeature(mapview.interaction.current)

      // Clear touch highlight.
      clear()

      return;
    }

    // Change cursor if the highlight is selectable.
    if (mapview.interaction.current.layer.infoj) mapview.Map.getTargetElement().style.cursor = 'pointer'

    // Execute hover method assigned to the current feature layer.
    // Only if no popup is present.
    !mapview.popup() && typeof mapview.interaction.current.layer.hover?.show === 'function' && mapview.interaction.current.layer.hover.show(feature.F)

    // Style the feature itself if possible.
    if (mapview.interaction.current.layer.format !== 'mvt'
      && typeof mapview.interaction.current.F.setStyle === 'function') {

      feature.F.set('highlight', true)
      mapview.interaction.current.F.setStyle()

    } else if (mapview.interaction.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      mapview.interaction.current.layer.L.changed()
    }
  }

  let clicked;

  // Select the current highlighted feature.
  function click(e) {

    // A popup is open.
    if (mapview.popup()) {

      // Close the popup.
      mapview.popup(null)
      return;
    }

    // Reset cursor.
    mapview.Map.getTargetElement().style.cursor = 'auto'

    // Clear longClick timeout.
    clearTimeout(mapview.interaction.longClickTimeout)

    if (mapview.interaction.longClick && typeof mapview.interaction.longClickMethod === 'function') {

      mapview.interaction.longClickMethod(e, mapview)
      return;
    }

    // Limit click event to 600ms
    if (clicked) return;

    clicked = setTimeout(() => { clicked = null }, 600);

    // There is no current highlighted feature without pointerMove.
    // Simulate pointermove on the touch click coordinates.
    if (e.originalEvent.pointerType === 'touch') {

      mapview.interaction.candidateKeys = new Set();
      e.type = 'touchClick'
      pointerMove(e)
      return
    }
    
    // Remove any existing popup. e.g. Cluster select dialogue.
    mapview.popup(null)

    // Return if there is no current highlight to select.
    if (mapview.interaction.current) {
      mapview.interaction.getFeature(mapview.interaction.current);
      return;
    }

    // Execute the noLocationClick method
    if (typeof mapview.interaction.noLocationClick === 'function') {
      mapview.interaction.noLocationClick(e)
    }
  }

  function clear() {

    // Highlight has already been cleared.
    if (!mapview.interaction.current) return;

    // Remove any infotip.
    mapview.infotip(null)

    // Reset cursor.
    mapview.Map.getTargetElement().style.cursor = 'auto'

    // Delete the highlight id from current layer.
    delete mapview.interaction.current.layer.highlight

    // Style the feature itself if possible.
    if (mapview.interaction.current.layer.format !== 'mvt'
      && typeof mapview.interaction.current.F.setStyle === 'function') {

      mapview.interaction.current.F.set('highlight', false)
      mapview.interaction.current.F.setStyle()

    } else if (mapview.interaction.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      mapview.interaction.current.layer.L.changed()
    }

    // Delete the current highlight object.
    delete mapview.interaction.current
  }

  function getFeature(feature) {

    if (!feature.layer.infoj) return;

    // Get the properties of the current highlight feature.
    const properties = feature.F.getProperties()

    // Return with a select dialogue for cluster feature.
    if (properties.count > 1) {

      // Get cluster features
      const features = feature.F.get('features')

      if (Array.isArray(features)) {

        // Get list of cluster feature label and id.
        let featuresList = features.map(f => {
          let F = f.getProperties()
          return {
            id: F.id,
            label: F.properties[feature.layer.cluster?.label]
          }})

        // Create list to get cluster features
        const list = mapp.utils.html.node`
        <div style="max-width: 66vw; max-height: 300px; overflow-x: hidden;">
          <ul>
          ${featuresList.map(li => mapp.utils.html.node`
            <li
              onclick=${e => {
                mapview.popup(null)
                mapp.location.get({
                  layer: feature.layer,
                  table: feature.layer.table || feature.layer.tableCurrent(),
                  id: li.id
                })
              }}>${li.label || li.id}`)}`;

        // Create popup to select cluster features.
        mapview.popup({
          coords: feature.F.getGeometry().getCoordinates(),
          content: list,
          autoPan: true,
        });

        return;
      }

      mapp.location.nnearest({
        mapview: mapview.interaction.mapview,
        layer: feature.layer,
        table: feature.layer.table || feature.layer.tableCurrent(),
        feature: feature.F
      })
      return;
    }

    // Select the current highlight feature.
    mapp.location.get({
      layer: feature.layer,
      table: feature.layer.table || feature.layer.tableCurrent(),
      id: feature.id
    })
  }

  // Finished the highlight mapview.interaction.
  function finish() {

    // Clear must be called before interaction is nulled.
    clear()

    // Remove popup from mapview.
    mapview.popup(null)

    // Remove event listener from mapview.
    mapview.Map.un('pointermove', pointerMove)
    mapview.Map.un('click', click)
    mapview.Map.getTargetElement().removeEventListener('mousedown', mouseDown)
    mapview.Map.getTargetElement().removeEventListener('touchstart', touchStart)
    mapview.Map.getTargetElement().removeEventListener('mouseup', mouseUp)

    // Execute callback if defined as function.
    if (mapview.interaction.callback instanceof Function) {

      // Must be run delayed to prevent a callback loop.
      const callback = mapview.interaction.callback
      setTimeout(callback, 400)
    }

    delete mapview.interaction
  }
}