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

    _xyz.mapview.interaction.highlight.featureSet = new Set();

    _xyz.mapview.node.addEventListener('click', select);

    _xyz.mapview.node.addEventListener('touchstart', touchSelect);

    _xyz.mapview.node.addEventListener('mousemove', mouseMove);

    _xyz.mapview.node.addEventListener('mouseout', mouseOut);

  };

  function mouseOut(e) {

    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    };
    clear();
  }

  function mouseMove(e) {
    e.preventDefault();

    _xyz.mapview.pointerLocation = {
      x: e.clientX,
      y: e.clientY
    };
    _xyz.mapview.infotip.node && _xyz.mapview.infotip.position();

    clearTimeout(_xyz.mapview.interaction.timeout);
    _xyz.mapview.interaction.timeout = setTimeout(()=>pointerMove(e), 100);
  }

  function pointerMove(e) {

    const featureSet = new Set();

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(_xyz.map.getEventPixel(e), (feature, featureLayer) => {

      // Add feature to current set.
      featureSet.add(feature);

      if (_xyz.mapview.interaction.highlight.featureSet.has(feature)) return;

      // Set highlight layer / feature.
      _xyz.mapview.interaction.highlight.feature = feature;
      _xyz.mapview.interaction.highlight.layer = featureLayer.get('layer');
      _xyz.mapview.interaction.highlight.layer.highlight = feature.get('id');

      _xyz.mapview.node.style.cursor = 'pointer';

      // Redraw layer to style highlight.
      _xyz.mapview.interaction.highlight.layer.L.setStyle(
        _xyz.mapview.interaction.highlight.layer.L.getStyle()
      );

      // Check for hover.
      _xyz.mapview.interaction.highlight.layer.hover
        && _xyz.mapview.interaction.highlight.layer.hover.field
        && _xyz.mapview.interaction.highlight.layer.infotip();

    }, {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer;
        });
      },
      hitTolerance: 0,
    });

    // Assign current set to highlight object.
    _xyz.mapview.interaction.highlight.featureSet = featureSet;

    // Clear if current set is empty or highlighted feature is not in current set.
    if (!featureSet.size || !featureSet.has(_xyz.mapview.interaction.highlight.feature)) clear();

  }

  function touchSelect(e) {

    if (e.touches.length > 1) return;

    //e.preventDefault();
    _xyz.mapview.node.removeEventListener('click', select);

    const featureSet = new Set();

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(_xyz.map.getEventPixel(e), (feature, featureLayer) => {

      // Add feature to current set.
      featureSet.add(feature);

      if (_xyz.mapview.interaction.highlight.featureSet.has(feature)) return;

      // Set highlight layer / feature.
      _xyz.mapview.interaction.highlight.feature = feature;
      _xyz.mapview.interaction.highlight.layer = featureLayer.get('layer');

    }, {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.L === featureLayer;
        });
      },
      hitTolerance: 0,
    });

    // Assign current set to highlight object.
    _xyz.mapview.interaction.highlight.featureSet = featureSet;

    featureSet.size && _xyz.mapview.interaction.highlight.feature && _xyz.mapview.interaction.highlight.layer.select(_xyz.mapview.interaction.highlight.feature);

  }

  function finish() {
    _xyz.mapview.node.removeEventListener('click', select);
    _xyz.mapview.node.removeEventListener('touchstart', touchSelect);
    _xyz.mapview.node.removeEventListener('mousemove', mouseMove);
    _xyz.mapview.node.removeEventListener('mouseout', mouseOut);
  }

  function select(e) {

    //if (e.mozInputSource === 5) return;

    if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay);

    if (!_xyz.mapview.interaction.highlight.layer) return;

    if (!_xyz.mapview.interaction.highlight.feature) return;

    _xyz.mapview.interaction.highlight.layer.select(_xyz.mapview.interaction.highlight.feature);
  }

  function clear() {

    _xyz.mapview.interaction.highlight.featureSet = new Set();

    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.node.remove();

    if (!_xyz.mapview.interaction.highlight.layer) return;

    _xyz.mapview.interaction.highlight.layer.highlight = true;
    _xyz.mapview.node.style.cursor = 'auto';
    _xyz.mapview.interaction.highlight.layer.L.setStyle(_xyz.mapview.interaction.highlight.layer.L.getStyle());

    delete _xyz.mapview.interaction.highlight.layer;
    delete _xyz.mapview.interaction.highlight.feature;
  }

};