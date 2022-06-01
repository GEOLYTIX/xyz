export default function(params){

  const mapview = this

  // Finish the current interaction.
  // Only one interaction can be current.
  mapview.interaction?.finish()

  const interaction = Object.assign({
    type: 'highlight',
    finish,
    clear,
    highlight,
    getLocation,
    hitTolerance: 5,
    candidates: {},
    candidateKeys: new Set(),

    // Filter for layers which have a highlight style.
    layerFilter: L => Object.values(mapview.layers)

      // layer L matching the feature layer L must have a qID defined
      .some(layer => layer.qID && layer.L === L)
  }, params)

  // Assign highlight to be the current interaction.
  mapview.interaction = interaction

  // pointerMove will highlight features.
  mapview.Map.on('pointermove', pointerMove)

  // click will select the highlighted feature.
  mapview.Map.on('click', click)

  // Moving the mouse from the mapview element should clear the highlight.
  mapview.Map.getTargetElement().addEventListener('mouseout', clear)

  // Reset cursor.
  mapview.Map.getTargetElement().style.cursor = 'auto'

  // Finished the highlight interaction.
  function finish() {

    delete mapview.interaction
    
    // Remove event listener from mapview.
    mapview.Map.un('pointermove', pointerMove)
    mapview.Map.un('click', click)
    mapview.Map.getTargetElement().removeEventListener('mouseout', clear)
  }

  let shortCircuit

  function pointerMove(e) {

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
        layerFilter: interaction.layerFilter,
        hitTolerance: interaction.hitTolerance,
      })

    // No features at pixel.
    if (!Object.keys(candidates).length) {

      // Reset candidateKeys
      interaction.candidateKeys = new Set();

      // Remove shortCircuit flag.
      shortCircuit = false;

      // Clear highlight.
      clear();

      // There is nothing to highlight.
      return;
    }

    // Check whether set of candidate keys is equal to interaction.candidateKeys
    if (mapp.utils.areSetsEqual(interaction.candidateKeys, new Set(Object.keys(candidates)))) {

      // Remove shortCircuit flag
      shortCircuit = false;

      // The highlight hasn't changed.
      return;
    }

    // Find candidate from key which is not in candidates set.
    let candidate = candidates[Object.keys(candidates).find(key => !interaction.candidateKeys.has(key))]

    // Assign candidate from first key if candidate is falsy.
    candidate = candidate
      || interaction.current?.key && candidates[interaction.current?.key]
      || candidates[Object.keys(candidates)[0]]

    // Assign new Set of candidate keys to interaction.
    interaction.candidateKeys = new Set(Object.keys(candidates))

    // Remove shortCircuit flag.
    shortCircuit = false;

    // Call highlight method.
    interaction.highlight(candidate, e)
  }

  function highlight(feature, e) {

    // Highlight method should only be called if the highlight has changed.
    clear()

    // Assign the layer and ID to the candidate object.
    interaction.current = Object.assign(feature, {
      layer: mapview.layers[feature.L.get('key')],
      id: feature.F.get('id') || feature.F.getId()
    })

    // Assign the id to the layer highlight key.
    // Required to determine in the style function whether the current feature should be styled as highlighted.
    interaction.current.layer.highlight = feature.id

    // Touch events should not highlight features since there is no cursor.
    if (e.originalEvent.pointerType !== 'mouse') {

      // Don't get location from touch pan or zoom pinch event.
      e.type !== 'pointermove' && interaction.getLocation(interaction.current)

      // Clear touch highlight.
      clear()

      return;
    }

    // Change cursor if the highlight is selectable.
    if (interaction.current.layer.infoj) mapview.Map.getTargetElement().style.cursor = 'pointer'

    // Execute any hover method assigned to the current feature layer.
    typeof interaction.current.layer.hover?.show === 'function' && interaction.current.layer.hover.show(feature.F)

    // Style the feature itself if possible.
    if (interaction.current.layer.format !== 'mvt'
      && typeof interaction.current.F.setStyle === 'function') {

      feature.F.set('highlight', true)
      interaction.current.F.setStyle()

    } else if (interaction.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      interaction.current.layer.L.changed()
    }
  }

  // Select the current highlighted feature.
  function click(e) {

    // There is no current highlighted feature without pointerMove.
    // Simulate pointermove on the touch click coordinates.
    if (e.originalEvent.pointerType === 'touch') {

      interaction.candidateKeys = new Set();
      e.type = 'touchClick'
      pointerMove(e)
      return
    }
    
    // Remove any existing popup. e.g. Cluster select dialogue.
    mapview.popup(null)

    // Return if there is no current highlight to select.
    interaction.current && interaction.getLocation(interaction.current)
  }

  function clear() {

    // Highlight has already been cleared.
    if (!interaction.current) return;

    // Remove any infotip.
    mapview.infotip(null)

    // Reset cursor.
    mapview.Map.getTargetElement().style.cursor = 'auto'

    // Delete the highlight id from current layer.
    delete interaction.current.layer.highlight

    // Style the feature itself if possible.
    if (interaction.current.layer.format !== 'mvt'
      && typeof interaction.current.F.setStyle === 'function') {

      interaction.current.F.set('highlight', false)
      interaction.current.F.setStyle()

    } else if (interaction.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      interaction.current.layer.L.changed()
    }

    // Delete the current highlight object.
    delete interaction.current
  }

  function getLocation(feature) {

    // Get the properties of the current highlight feature.
    const properties = feature.F.getProperties()

    // Return with a select dialogue for cluster feature.
    if (properties.count > 1) {
      mapp.location.nnearest({
        mapview,
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
      id: feature.layer.highlight
    })
  }
}