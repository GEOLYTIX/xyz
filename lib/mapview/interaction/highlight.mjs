export default _xyz => {

  const highlight = {

    begin: begin,

    pointerMove: pointerMove,

    finish: finish,

    select: select,

    clear: clear,

  };

  return highlight;


  function begin() {

    _xyz.mapview.interaction.current
      && _xyz.mapview.interaction.current.finish
      && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = highlight;

    _xyz.mapview.node.style.cursor = 'auto';

    highlight.featureSet = new Set();

    if (_xyz.utils.touch()) {
      _xyz.mapview.node.addEventListener('touchend', touchSelect);
      _xyz.mapview.node.addEventListener('touchmove', touchMove);
      _xyz.mapview.node.addEventListener('touchstart', touchMove);
    }

    _xyz.mapview.node.addEventListener('click', select);

    _xyz.mapview.node.addEventListener('mousemove', mouseMove);

    _xyz.mapview.node.addEventListener('mouseout', mouseOut);
  };

  function touchMove(e) {
    highlight.lastmove = e;
  }

  function mouseMove(e) {
    if (_xyz.mapview.interaction.break) return;

    _xyz.mapview.pointerLocation = {
      x: e.clientX,
      y: e.clientY
    };
    _xyz.mapview.infotip.node && _xyz.mapview.infotip.position();

    pointerMove(e);

    // clearTimeout(highlight.timeout);
    // highlight.timeout = setTimeout(()=>pointerMove(e), 100);
  }

  function mouseOut(e) {

    _xyz.mapview.pointerLocation = {
      x: null,
      y: null
    };
    clear();
  }

  function pointerMove(e) {

    const featureSet = new Set();

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(_xyz.map.getEventPixel(e), (feature, featureLayer) => {

      // Add feature to current set.
      featureSet.add(feature);

      if (highlight.featureSet.has(feature)) return;

      // Set highlight layer / feature.
      highlight.feature = feature;
      highlight.layer = featureLayer.get('layer');
      highlight.layer.highlight = feature.get('id');

      _xyz.mapview.node.style.cursor = 'pointer';

      // Redraw layer to style highlight.
      highlight.layer.L.setStyle(
        highlight.layer.L.getStyle()
      );

      // Check for hover.
      highlight.layer.hover
        && highlight.layer.hover.field
        && highlight.layer.infotip();

    }, {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.style && layer.style.highlight && layer.L === featureLayer;
        });
      },
      hitTolerance: 5,
    });

    // Assign current set to highlight object.
    highlight.featureSet = featureSet;

    // Clear if current set is empty or highlighted feature is not in current set.
    if (!featureSet.size || !featureSet.has(highlight.feature)) clear();
  }

  function touchSelect(e) {
    e.preventDefault();
    highlight.recentTouched = true;
    setTimeout(() => delete highlight.recentTouched, 500);
    if (_xyz.mapview.interaction.break) return;

    if (e.touches.length > 1) return;

    const featureSet = new Set();

    // Iterate through all features (with layer) at pixel
    _xyz.map.forEachFeatureAtPixel(_xyz.map.getEventPixel(highlight.lastmove), (feature, featureLayer) => {

      // Add feature to current set.
      featureSet.add(feature);

      if (highlight.featureSet.has(feature)) return;

      // Set highlight layer / feature.
      highlight.feature = feature;
      highlight.layer = featureLayer.get('layer');

    }, {
      layerFilter: featureLayer => {

        // Filter for layers which have a highlight style.
        return Object.values(_xyz.layers.list).some(layer => {
          return layer.qID && layer.L === featureLayer;
        });
      },
      hitTolerance: 5,
    });

    // Assign current set to highlight object.
    highlight.featureSet = featureSet;

    featureSet.size && highlight.feature && highlight.layer.select(highlight.feature);
  }

  function finish() {
    _xyz.mapview.node.removeEventListener('click', select);
    if (_xyz.utils.touch()) {
      _xyz.mapview.node.removeEventListener('touchend', touchSelect);
      _xyz.mapview.node.removeEventListener('touchmove', touchMove);
      _xyz.mapview.node.removeEventListener('touchstart', touchMove);
    }
    _xyz.mapview.node.removeEventListener('mousemove', mouseMove);
    _xyz.mapview.node.removeEventListener('mouseout', mouseOut);
  }

  function select() {

    if (highlight.recentTouched) return;

    if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay);

    if (!highlight.layer) return;

    if (!highlight.feature) return;

    highlight.layer.select(highlight.feature);
  }

  function clear() {

    highlight.featureSet = new Set();

    if (_xyz.mapview.infotip.node) _xyz.mapview.infotip.node.remove();

    if (!highlight.layer) return;

    highlight.layer.highlight = true;
    _xyz.mapview.node.style.cursor = 'auto';
    highlight.layer.L.setStyle(highlight.layer.L.getStyle());

    delete highlight.layer;
    delete highlight.feature;
  }

};