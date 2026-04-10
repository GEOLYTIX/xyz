/**
## /mapview/allFeatures

The allFeatures method exported from the module is assigned to a mapview in the [mapview decorator]{@link module:/mapview~decorate}

@module /mapview/allFeatures
*/

/**
@function allFeatures

@description
The allFeatures method checks for all features at a pixel location with the [highlight] interaction.layerFilter and interaction.hitTolerance as options.

A list element is created for each feature with the element click event passing the feature as argument to the interaction getFeature method.

@param {object} e The click event.
@param {mapview} mapview The mapview from which the click [Map] event originates.
@property {Object} e.pixel The pixel object for the click event pointer location.
*/
export default function allFeatures(e, mapview) {
  // Remove popup from mapview.
  mapview.popup(null);

  const features = [];

  const callback = (F, L) => {
    const feature = {
      F,
      id: F.get('id') || F.getId(),
      L,
      layer: mapview.layers[L.get('key')],
    };

    features.push(feature);
  };

  const options = {
    hitTolerance: mapview.interaction.hitTolerance,
    layerFilter: mapview.interaction.layerFilter,
  };

  // Find features at pixel.
  mapview.Map.forEachFeatureAtPixel(e.pixel, callback, options);

  // No features at pixel.
  if (!features.length) return;

  const list = features.map(
    (feature) => mapp.utils.html`
    <li onclick=${(e) => {
      mapview.interaction.getFeature(feature);
      mapview.popup(null);
    }}>${feature.L.get('key')} [${feature.id}]`,
  );

  const content = mapp.utils.html.node`<ul class="list">${list}`;

  mapview.popup({
    autoPan: true,
    content,
  });
}
