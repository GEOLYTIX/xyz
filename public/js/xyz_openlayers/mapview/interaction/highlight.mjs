export default _xyz => {

  return {

    begin: begin,

    pointerMove: pointerMove,

    finish: finish,

    select: select,

    clear: clear,

  };


  function begin() {

    _xyz.mapview.interaction.current.finish && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = _xyz.mapview.interaction.highlight;

    _xyz.mapview.node.style.cursor = 'auto';

    _xyz.map.on('click', select);

    _xyz.mapview.node.addEventListener('mousemove', mouseMove);
  
    _xyz.mapview.node.addEventListener('mousemove', _xyz.mapview.interaction.highlight.pointerMove);
  
    _xyz.mapview.node.addEventListener('mouseout', mouseOut);

  };

  function mouseOut() {
    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    };
    clear();
  }

  function mouseMove(e) {

    _xyz.mapview.pointerLocation = {
      x: e.clientX,
      y: e.clientY
    };
    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.position();

  }

  function pointerMove(e) {

    const pixel = _xyz.map.getEventPixel(e);

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
    if (!featureArray) return clear();
    
    // Return is feature is already highlighted.
    // The first feature in the array will be the feature with the highest zIndex.
    if (_xyz.mapview.interaction.highlight.feature === featureArray[0]) return;
  
    // Redraw layer with previous highlighted feature.
    clear();

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(pixel, (feature, featureLayer) => {

      if (feature === featureArray[0]) {

      // Set highlight layer / feature.
        _xyz.mapview.interaction.highlight.layer = featureLayer.get('layer');
        _xyz.mapview.interaction.highlight.feature = feature;

        // Assign feature id to the layer object.
        _xyz.mapview.interaction.highlight.layer.highlight = feature.get('id');

        _xyz.mapview.node.style.cursor = 'pointer';

        if (_xyz.mapview.interaction.highlight.layer.hover && _xyz.mapview.interaction.highlight.layer.hover.field) {

          _xyz.mapview.interaction.highlight.layer.infotip();

        }

        // Redraw layer to style highlight.
        return _xyz.mapview.interaction.highlight.layer.L.setStyle(
          _xyz.mapview.interaction.highlight.layer.L.getStyle()
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

  }


  function finish() {

    _xyz.map.un('click', select);

    _xyz.mapview.node.removeEventListener('mousemove', pointerMove);

    _xyz.mapview.node.removeEventListener('mousemove', mouseMove);

    _xyz.mapview.node.removeEventListener('mouseout', mouseOut);

  }


  function select() {

    if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay);

    if (!_xyz.mapview.interaction.highlight.layer) return;
    
    if (!_xyz.mapview.interaction.highlight.feature) return;
  
    _xyz.mapview.interaction.highlight.layer.select(_xyz.mapview.interaction.highlight.feature);
  }


  function clear() {

    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.node.remove();

    if (!_xyz.mapview.interaction.highlight.layer) return;
  
    _xyz.mapview.interaction.highlight.layer.highlight = true;

    _xyz.mapview.node.style.cursor = 'auto';
                
    _xyz.mapview.interaction.highlight.layer.L.setStyle(_xyz.mapview.interaction.highlight.layer.L.getStyle());

    delete _xyz.mapview.interaction.highlight.layer;

    delete _xyz.mapview.interaction.highlight.feature;
  }

};