export default _xyz => function(e) {

  const pixel = _xyz.map.getEventPixel(e);

  _xyz.mapview.pointerLocation = {
    x: e.clientX,
    y: e.clientY
  };

  // Get features from layers which have a highlight style.
  const featureArray = _xyz.map.getFeaturesAtPixel(pixel,{

    // Filter for layers which have a highlight style.
    layerFilter: featureLayer => {
      return Object.values(_xyz.layers.list).some(layer => {
        return layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer;
      });
    },
    hitTolerance: 0,
  });

    // Return and clear highlight if no features are found.
  if (!featureArray) return _xyz.mapview.clearHighlight();
    
  // Return is feature is already highlighted.
  // The first feature in the array will be the feature with the highest zIndex.
  if (_xyz.mapview.highlight.feature === featureArray[0]) {

    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.position();

    return;
  }

  // Redraw layer with previous highlighted feature.
  _xyz.mapview.clearHighlight();

  // Iterate through all features (with layer) at pixel
  _xyz.map.forEachFeatureAtPixel(pixel, (feature, featureLayer) => {

    if (feature === featureArray[0]) {

      // Set highlight layer / feature.
      _xyz.mapview.highlight.layer = featureLayer.get('layer');
      _xyz.mapview.highlight.feature = feature;

      // Assign feature id to the layer object.
      _xyz.mapview.highlight.layer.highlight = feature.get('id');

      _xyz.mapview.node.style.cursor = 'pointer';

      if (_xyz.mapview.highlight.layer.hover && _xyz.mapview.highlight.layer.hover.field) {

        _xyz.mapview.highlight.layer.infotip();

      }

      // Redraw layer to style highlight.
      return _xyz.mapview.highlight.layer.L.setStyle(
        _xyz.mapview.highlight.layer.L.getStyle()
      );

    }
        
  },{
    layerFilter: featureLayer => {
      // Filter for layers which have a highlight style.
      return Object.values(_xyz.layers.list).some(layer => {
        return layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer;
      });
    },
    hitTolerance: 0,
  });

};