let _this;

export default function(interaction) {

  // Remove snap interaction if already defined as _this.
  // Called when finishing a drawing or modify interaction.
  if (_this?.snapLayer && interaction === null) {
    
    _this.mapview.Map.removeInteraction(_this.snapInteraction)

    // Remove tileloadend event from MVT layer snapSource.
    _this.snapLayer.snapSource?.un('tileloadend', tileloadend);

    // Remove vectorTileLayer associated with the snapLayer.snapSource.
    // The layer is required in order to trigger the loadend event.
    _this.mapview.Map.removeLayer(_this.vectorTileLayer)

    return;
  }

  // Assign mapview and interaction to be _this.
  _this = Object.assign({ mapview: this }, interaction)

  // A snap layer is required for the snap interaction.
  if (!_this.snapLayer) return;

  // Create a snapSource
  _this.snapSource = new ol.source.Vector()

  // The .snapLayer has a snapSource (MVT only)
  if (_this.snapLayer.snapSource) {

    // Assign loadend event to MVT layer snapSource.
    _this.snapLayer.snapSource.on('tileloadend', tileloadend)

    // Create vectorTileLayer from MVT layer snapSource
    _this.vectorTileLayer = new ol.layer.VectorTile({
      source: _this.snapLayer.snapSource,
      opacity: 0
    })
  
    // Add vectorTileLayer to map and refresh source.
    _this.mapview.Map.addLayer(_this.vectorTileLayer)

    _this.snapLayer.snapSource.refresh()

  } else {

    // Assign snapSource from the snapLayer's OL source.
    _this.snapSource = _this.snapLayer.L.getSource()
  }

  // Create and assign snap interaction.
  _this.snapInteraction = new ol.interaction.Snap({
    source: _this.snapSource
  })

  _this.mapview.Map.addInteraction(_this.snapInteraction)
}

function tileloadend(e){

  // Assign features from tile to the snap source.
  _this.snapSource.addFeatures(e.tile.getFeatures())
}