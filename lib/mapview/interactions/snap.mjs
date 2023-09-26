export default function(mapview) {

  // The current draw/modify interaction doesn't snap.
  if (!mapview.interaction.snap) return;

  // Assign mapview and interaction to be _this.
  mapview.interaction.snap = {
    remove: ()=>{

      if (mapview.interaction.layer.featureSource) {

        // Detach tile load event,
        mapview.interaction.layer.featureSource.un('tileloadend', tileloadend)

        // Remove featureSource layer from mapview.Map,
        mapview.Map.removeLayer(mapview.interaction.snap.vectorTileLayer)

        // And clear featureSource.
        mapview.interaction.layer.featureSource.clear()
      }

      mapview.Map.removeInteraction(mapview.interaction.snap.interaction)
    }
  }

  function tileloadend(e) {

    // Add features from tile to the snap.source.
    mapview.interaction.snap.source.addFeatures(e.tile.getFeatures())
  }

  // Only MVT layer have a snapSource.
  if (mapview.interaction.layer.featureSource) {

    // Create new Vector source for snap features.
    mapview.interaction.snap.source = new ol.source.Vector()

    // Assign loadend event to MVT layer featureSource.
    mapview.interaction.layer.featureSource.on('tileloadend', tileloadend)

    mapview.interaction.snap.vectorTileLayer = new ol.layer.VectorTile({
      source: mapview.interaction.layer.featureSource,
      opacity: 0
    })
  
    // Add invisible tile layer for the featureSource to trigger tile loads.
    mapview.Map.addLayer(mapview.interaction.snap.vectorTileLayer)

  } else {

    // Assign vector source as snap source for vector layer.
    mapview.interaction.snap.source = mapview.interaction.layer.L.getSource()
  }

  // Create snap interaction with snap.source.
  mapview.interaction.snap.interaction = new ol.interaction.Snap({
    source: mapview.interaction.snap.source
  })
  
  // Add snap.interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.snap.interaction)
}