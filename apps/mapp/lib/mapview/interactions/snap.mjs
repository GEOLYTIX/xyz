/**
 * ### mapview.interactions.snap()
 * This module sets up the snap interaction for the mapview.
 * @module /mapview/interactions/snap
 */

/**
 * Sets up the snap interaction for the mapview.
 * @function snap
 * @param {Object} mapview - The mapview object.
 * @param {ol.Map} mapview.Map - The OpenLayers map object.
 * @param {Object} mapview.interaction - The interaction object.
 * @param {boolean|Object} mapview.interaction.snap - The snap interaction configuration.
 * @param {string} [mapview.interaction.snap.layer] - The key of the layer to snap to.
 * @param {ol.layer.Layer} mapview.interaction.layer - The interaction layer.
 * @param {Object} mapview.layers - The map layers object.
 */
export default function (mapview) {
  // The current draw/modify interaction doesn't snap.
  if (!mapview.interaction.snap) return;

  if (mapview.interaction.snap === true) {
    // Assign the interaction layer as snap layer if snap is true.
    mapview.interaction.snap = {
      layer: mapview.interaction.layer.key,
    };
  }

  if (typeof mapview.interaction.snap === 'string') {
    // Assign the interaction layer as snap layer if snap is a string.
    mapview.interaction.snap = {
      layer: mapview.interaction.snap,
    };
  }
  // Assign mapview and interaction to be _this.
  mapview.interaction.snap = {
    /**
     * Removes the snap interaction and related resources.
     */
    remove: () => {
      if (mapview.interaction.layer.featureSource) {
        // Detach tile load event,
        mapview.interaction.layer.featureSource.un('tileloadend', tileloadend);

        // Remove featureSource layer from mapview.Map,
        mapview.Map.removeLayer(mapview.interaction.snap.vectorTileLayer);

        // And clear featureSource.
        mapview.interaction.layer.featureSource.clear();
      }

      mapview.Map.removeInteraction(mapview.interaction.snap.interaction);
    },

    ...mapview.interaction.snap,
  };

  // Check if snap layer exists in mapview.layers.
  if (!mapview.layers[mapview.interaction.snap.layer]) {
    console.warn(
      `Unable to snap to layer:${mapview.interaction.snap.layer} as it is not found in mapview.layers.`,
    );
    return;
  }

  // Assign snap layer from key if defined.
  mapview.interaction.snap.layer &&=
    mapview.layers[mapview.interaction.snap.layer] || mapview.interaction.layer;

  // Assign interaction as snap layer if undefined.
  mapview.interaction.snap.layer ??= mapview.interaction.layer;

  mapview.interaction.snap.layer.show();

  /**
   * Callback function for the `tileloadend event of the feature source.
   * Adds features from the loaded tile to the snap source.
   * @param {ol.TileLoadEvent} e - The tile load event.
   */
  function tileloadend(e) {
    const features = e.tile.getFeatures();

    // Try adding features to prevent a crash adding the same feature twice.
    try {
      mapview.interaction.snap.source.addFeatures(features);
    } catch {}
  }

  if (mapview.interaction.snap.layer.featureSource) {
    // Create new Vector source for snap features.
    mapview.interaction.snap.source = new ol.source.Vector();

    // Assign loadend event to MVT layer featureSource.
    mapview.interaction.snap.layer.featureSource.on('tileloadend', tileloadend);

    mapview.interaction.snap.vectorTileLayer = new ol.layer.VectorTile({
      opacity: 0,
      source: mapview.interaction.snap.layer.featureSource,
    });

    // Add invisible tile layer for the featureSource to trigger tile loads.
    mapview.Map.addLayer(mapview.interaction.snap.vectorTileLayer);
  } else {
    // Assign vector source as snap source for vector layer.
    mapview.interaction.snap.source =
      mapview.interaction.snap.layer.L.getSource();
  }

  // Create snap interaction with snap.source.
  mapview.interaction.snap.interaction = new ol.interaction.Snap({
    source: mapview.interaction.snap.source,
  });

  // Add snap.interaction to mapview.Map
  mapview.Map.addInteraction(mapview.interaction.snap.interaction);
}
