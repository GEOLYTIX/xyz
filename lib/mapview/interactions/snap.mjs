let _this;

export default function(interaction) {

  // Remove snap interaction if defined.
  // Called from draw or modify interaction finish method.
  if (_this?.snap && interaction === null) {
    
    _this.mapview.Map.removeInteraction(_this.snap.interaction)

    // Remove loadend event MVT layer snapSource.
    _this.layer.snapSource?.un('tileloadend', tileloadend);

    // Remove vectorTileLayer associated with the MVT layer snapSource.
    _this.mapview.Map.removeLayer(_this.snap.vectorTileLayer)

    return;
  }

  // A snap layer is required for the snap interaction.
  if (!interaction.snap) return;

  // Assign mapview and interaction to be _this.
  _this = Object.assign(interaction, {
    snap: {
      source: new ol.source.Vector()
    }
  })

  // Only MVT layer have a snapSource.
  if (_this.layer.snapSource) {

    // Assign loadend event to MVT layer snapSource.
    _this.layer.snapSource.on('tileloadend', tileloadend)

    // An invisible VectorTile layer is required to trigger the loadend event.
    _this.snap.vectorTileLayer = new ol.layer.VectorTile({
      source: _this.layer.snapSource,
      opacity: 0
    })
  
    _this.mapview.Map.addLayer(_this.snap.vectorTileLayer)

    // Refresh the snapSource in order to trigger the loadend event.
    _this.layer.snapSource.refresh()

  } else {

    // Assign snapSource from the snapLayer's OL source.
    _this.snap.source = _this.layer.L.getSource()
  }

  // Create and assign snap interaction.
  _this.snap.interaction = new ol.interaction.Snap({
    source: _this.snap.source
  })

  _this.mapview.Map.addInteraction(_this.snap.interaction)
}

function tileloadend(e){

  // Assign features from tile to the snap source.
  _this.snap.source.addFeatures(e.tile.getFeatures())
}