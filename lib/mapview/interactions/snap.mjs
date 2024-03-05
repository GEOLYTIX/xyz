/**
@module /mapview/interactions/snap
*/

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
    },

    ...mapview.interaction.snap
  }

  // Check if snap layer exists in mapview.layers.
  if (!mapview.layers[mapview.interaction.snap.layer]) {
  console.warn(`Unable to snap to layer:${mapview.interaction.snap.layer} as it is not found in mapview.layers.`)
  return;
  }

  // Assign snap layer from key if defined.
  mapview.interaction.snap.layer &&= mapview.layers[mapview.interaction.snap.layer] || mapview.interaction.layer

  // Assign interaction as snap layer if undefined.
  mapview.interaction.snap.layer ??= mapview.interaction.layer

  mapview.interaction.snap.layer.show()

  function tileloadend(e) {

    const features = e.tile.getFeatures()

    // Try adding features to prevent a crash adding the same feature twice.
    try {
      mapview.interaction.snap.source.addFeatures(features)
    } catch {}
    
  }

  // Only MVT layer have a snapSource.
  if (mapview.interaction.snap.layer.featureSource) {

    // Create new Vector source for snap features.
    mapview.interaction.snap.source = new ol.source.Vector()

    // Assign loadend event to MVT layer featureSource.
    mapview.interaction.snap.layer.featureSource.on('tileloadend', tileloadend)

    mapview.interaction.snap.vectorTileLayer = new ol.layer.VectorTile({
      source: mapview.interaction.snap.layer.featureSource,
      opacity: 0
    })
  
    // Add invisible tile layer for the featureSource to trigger tile loads.
    mapview.Map.addLayer(mapview.interaction.snap.vectorTileLayer)

  } else {

    // Assign vector source as snap source for vector layer.
    mapview.interaction.snap.source = mapview.interaction.snap.layer.L.getSource()
  }

  // Create snap interaction with snap.source.
  mapview.interaction.snap.interaction = new ol.interaction.Snap({
    source: mapview.interaction.snap.source
  })
  
  // Add snap.interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.snap.interaction)
}