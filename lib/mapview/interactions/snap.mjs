export default function(mapview) {

  if (!mapview.interaction.snap) return;

  // Assign mapview and interaction to be _this.
  mapview.interaction.snap = {
    source: new ol.source.Vector(),
    tileloadend: e => {

      // Assign features from tile to the snap source.
      mapview.interaction.snap.source.addFeatures(e.tile.getFeatures())
    }
  }

  // Only MVT layer have a snapSource.
  if (mapview.interaction.layer.featureSource) {

    // Assign loadend event to MVT layer snapSource.
    mapview.interaction.layer.featureSource.on('tileloadend', mapview.interaction.snap.tileloadend)

    // An invisible VectorTile layer is required to trigger the loadend event.
    mapview.interaction.snap.vectorTileLayer = new ol.layer.VectorTile({
      source: mapview.interaction.layer.featureSource,
      opacity: 0
    })
  
    mapview.Map.addLayer(mapview.interaction.snap.vectorTileLayer)

    // Refresh the snapSource in order to trigger the loadend event.
    mapview.interaction.layer.featureSource.refresh()

  } else {

    // Assign snapSource from the snapLayer's OL source.
    mapview.interaction.snap.source = mapview.interaction.layer.L.getSource()
  }

  // Create and assign snap interaction.
  mapview.interaction.snap.interaction = new ol.interaction.Snap({
    source: mapview.interaction.snap.source
  })

  mapview.Map.addInteraction(mapview.interaction.snap.interaction)
}