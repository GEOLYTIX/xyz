let 
  snapSource,
  snapLayer,
  vectorTileSource,
  vectorTileLayer,
  snapInteraction;

export default function(interaction) {

  // this = mapview

  if (interaction === null) {
    
    // Remove snapInteraction
    this.Map.removeInteraction(snapInteraction)

    // Unassign tileloadend event from vectorTileSource
    vectorTileSource && vectorTileSource.un('tileloadend', tileloadend);

    // Remove vectorTileLayer from map.
    vectorTileLayer && this.Map.removeLayer(vectorTileLayer)

    vectorTileLayer = null

    // Remove invisible snapLayer from map.
    this.Map.removeLayer(snapLayer)

    return;
  }

  // Either a snapSource or snapLayer are required.
  if (!interaction.snapSource && !interaction.snapLayer) return;

  // Assign snapSource from interaction or create new.
  snapSource = interaction.snapSource || new ol.source.Vector()

  // Create snapLayer from snapSource.
  snapLayer = new ol.layer.Vector({
    source: snapSource,
    opacity: 0
  })

  // Add snapLayer to map.
  this.Map.addLayer(snapLayer)

  // The interaction.snapLayer has a snapSource (MVT only)
  if (interaction.snapLayer?.snapSource) {

    vectorTileSource = interaction.snapLayer.snapSource

    // Assign event to load vector features from vectorTileSource into snapSource.
    vectorTileSource.on('tileloadend', tileloadend)

    // Create vectorTileLayer from vectorTileSource
    vectorTileLayer = new ol.layer.VectorTile({
      source: vectorTileSource,
      opacity: 0
    })
  
    // Add vectorTileLayer to map and refresh source.
    this.Map.addLayer(vectorTileLayer)

    vectorTileSource.refresh()

  } else if (interaction.snapLayer){

    // Assign snapSource from the snapLayer's OL source.
    snapSource = interaction.snapLayer.L.getSource()
  }

  // Create and assign snap interaction.
  snapInteraction = new ol.interaction.Snap({
    source: snapSource
  })

  this.Map.addInteraction(snapInteraction)
}

function tileloadend(evt){
  snapSource.addFeatures(evt.tile.getFeatures())
}