let _this;

export default function(params){

  // Finish the current interaction.
  this.interaction?.finish()  

  _this = Object.assign({

    mapview: this,

    type: 'highlight',

    finish,

    clear,

    highlight,

    getLocation,

    hitTolerance: 5,

    candidates: {},

    candidateKeys: new Set(),

    locations: new Set(),

    longClickMethod: selectAll,

    longClickMS: 500,

    // Filter for layers which have a highlight style.
    layerFilter: L => Object.values(this.layers)

      // layer L matching the feature layer L must have a qID defined
      .some(layer => layer.qID && layer.L === L)

  }, params)

  // Set _this to be the current mapview _this.
  _this.mapview.interaction = _this

  // pointerMove will highlight features.
  _this.mapview.Map.on('pointermove', pointerMove)

  // click will select the highlighted feature.
  _this.mapview.Map.on('click', click)

  _this.mapview.Map.getTargetElement().addEventListener('mousedown', mouseDown)

  function mouseDown(){

    // Remove longClick flag.
    delete _this.longClick

    // Clear longClick timeout.
    clearTimeout(_this.longClickTimeout)

    // Set longClick timeout.
    _this.longClickTimeout = setTimeout(

      // Set longClick flag.
      () => {
        _this.longClick = true
        _this.mapview.Map.getTargetElement().style.cursor = 'wait'
      },
      
      // 1000ms default timeout for longclick.
      _this.longClickMS)
  }

  let shortCircuit

  function pointerMove(e) {

    // Reset cursor.
    _this.mapview.Map.getTargetElement().style.cursor = 'auto'

    // Clear longClick timeout.
    clearTimeout(_this.longClickTimeout)

    // Method should short circuit if still processing.
    if (shortCircuit) return;

    // Set shortCircuit flag.
    shortCircuit = true;

    let candidates = {};

    _this.mapview.Map.forEachFeatureAtPixel(e.pixel,
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
        layerFilter: _this.layerFilter,
        hitTolerance: _this.hitTolerance,
      })

    // No features at pixel.
    if (!Object.keys(candidates).length) {

      // Reset candidateKeys
      _this.candidateKeys = new Set();

      // Remove shortCircuit flag.
      shortCircuit = false;

      // Clear highlight.
      clear();

      // There is nothing to highlight.
      return;
    }

    // Check whether set of candidate keys is equal to _this.candidateKeys
    if (mapp.utils.areSetsEqual(_this.candidateKeys, new Set(Object.keys(candidates)))) {

      // Remove shortCircuit flag
      shortCircuit = false;

      // The highlight hasn't changed.
      return;
    }

    // Find candidate from key which is not in candidates set.
    let candidate = candidates[Object.keys(candidates).find(key => !_this.candidateKeys.has(key))]

    // Assign candidate from first key if candidate is falsy.
    candidate = candidate
      || _this.current?.key && candidates[_this.current?.key]
      || candidates[Object.keys(candidates)[0]]

    // Assign new Set of candidate keys to _this.
    _this.candidateKeys = new Set(Object.keys(candidates))

    // Remove shortCircuit flag.
    shortCircuit = false;

    // Call highlight method.
    _this.highlight(candidate, e)
  }

  function highlight(feature, e) {

    // Highlight method should only be called if the highlight has changed.
    clear()

    // Assign the layer and ID to the candidate object.
    _this.current = Object.assign(feature, {
      layer: _this.mapview.layers[feature.L.get('key')],
      id: feature.F.get('id') || feature.F.getId()
    })

    // Assign the id to the layer highlight key.
    // Required to determine in the style function whether the current feature should be styled as highlighted.
    _this.current.layer.highlight = feature.id

    // Touch events should not highlight features since there is no cursor.
    if (e.originalEvent.pointerType !== 'mouse') {

      // Don't get location from touch pan or zoom pinch event.
      e.type !== 'pointermove' && _this.getLocation(_this.current)

      // Clear touch highlight.
      clear()

      return;
    }

    // Change cursor if the highlight is selectable.
    if (_this.current.layer.infoj) _this.mapview.Map.getTargetElement().style.cursor = 'pointer'

    // Execute any hover method assigned to the current feature layer.
    typeof _this.current.layer.hover?.show === 'function' && _this.current.layer.hover.show(feature.F)

    // Style the feature itself if possible.
    if (_this.current.layer.format !== 'mvt'
      && typeof _this.current.F.setStyle === 'function') {

      feature.F.set('highlight', true)
      _this.current.F.setStyle()

    } else if (_this.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      _this.current.layer.L.changed()
    }
  }

  let clicked;

  // Select the current highlighted feature.
  function click(e) {

    // Reset cursor.
    _this.mapview.Map.getTargetElement().style.cursor = 'auto'

    // Clear longClick timeout.
    clearTimeout(_this.longClickTimeout)

    if (_this.longClick && typeof _this.longClickMethod === 'function') {

      _this.longClickMethod(e)
      return;
    }

    // Limit click event to 600ms
    if (clicked) return;

    clicked = setTimeout(() => { clicked = null }, 600);

    // There is no current highlighted feature without pointerMove.
    // Simulate pointermove on the touch click coordinates.
    if (e.originalEvent.pointerType === 'touch') {

      _this.candidateKeys = new Set();
      e.type = 'touchClick'
      pointerMove(e)
      return
    }
    
    // Remove any existing popup. e.g. Cluster select dialogue.
    _this.mapview.popup(null)

    // Return if there is no current highlight to select.
    if (_this.current) {
      _this.getLocation(_this.current);
      return;
    }

    // Execute the noLocationClick method
    if (typeof _this.noLocationClick === 'function') {
      _this.noLocationClick(e)
    }
  }

  function selectAll(e) {

    // Remove popup from mapview.
    _this.mapview.popup(null)

    const locations = [];

    // Find locations at pixel.
    _this.mapview.Map.forEachFeatureAtPixel(e.pixel,
      (F, L) => {

        const properties = F.getProperties()

        // Do not include cluster features.
        if (properties.count) return;

        // Push location key into locations array.
        locations.push(`${L.get('key') || ol.util.getUid(L)}!${F.get('id') || F.getId() || ol.util.getUid(F)}`)
      },
      {
        layerFilter: _this.layerFilter,
        hitTolerance: _this.hitTolerance,
      })

    // No features at pixel.
    if (!locations.length) return;

    const content = mapp.utils.html.node`
      <div style="max-width: 66vw; max-height: 300px; overflow-x: hidden;">
        <ul>
        ${locations.map(key => mapp.utils.html.node`
          <li onclick=${e => {           
            mapp.location.get({
              layer: _this.mapview.layers[key.split('!')[0]],
              id: key.split('!')[1]
            })

            _this.mapview.popup(null)
          }}
        }}>${key}`)}`;      

    _this.mapview.popup({
      content,
      autoPan: true,
    });
  }

  function clear() {

    // Highlight has already been cleared.
    if (!_this.current) return;

    // Remove any infotip.
    _this.mapview.infotip(null)

    // Reset cursor.
    _this.mapview.Map.getTargetElement().style.cursor = 'auto'

    // Delete the highlight id from current layer.
    delete _this.current.layer.highlight

    // Style the feature itself if possible.
    if (_this.current.layer.format !== 'mvt'
      && typeof _this.current.F.setStyle === 'function') {

      _this.current.F.set('highlight', false)
      _this.current.F.setStyle()

    } else if (_this.current.layer.style.highlight) {

      // Render unto canvas those things that are canvas'
      _this.current.layer.L.changed()
    }

    // Delete the current highlight object.
    delete _this.current
  }

  function getLocation(feature) {

    if (!feature.layer.infoj) return;

    // Get the properties of the current highlight feature.
    const properties = feature.F.getProperties()

    // Return with a select dialogue for cluster feature.
    if (properties.count > 1) {
      mapp.location.nnearest({
        mapview: _this.mapview,
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

  // Finished the highlight _this.
  function finish() {

    // Set the current interaction to null.
    _this.mapview.interaction = null

    clear()

    // Remove popup from mapview.
    _this.mapview.popup(null)

    // Remove event listener from mapview.
    _this.mapview.Map.un('pointermove', pointerMove)
    _this.mapview.Map.un('click', click)
    _this.mapview.Map.getTargetElement().removeEventListener('mousedown', mouseDown)
  }
}