export default _xyz => {

  const zoom = {

    begin: begin,

    finish: finish,

    cancel: cancel,

    Layer: new _xyz.mapview.lib.layer.Vector({
      source: new _xyz.mapview.lib.source.Vector()
    })

  }

  return zoom;

  function begin(params = {}) {

    _xyz.mapview.interaction.current
      && _xyz.mapview.interaction.current.finish
      && _xyz.mapview.interaction.current.finish();

    _xyz.mapview.interaction.current = zoom;

    zoom.callback = params.callback;

    zoom.Layer.getSource().clear();

    _xyz.map.addLayer(zoom.Layer);

    _xyz.mapview.node.style.cursor = 'zoom-in';

    zoom.interaction = new _xyz.mapview.lib.interaction.Draw({
      source: zoom.Layer.getSource(),
      type: 'Circle',
      geometryFunction: _xyz.mapview.lib.draw.createBox(),
      style: new _xyz.mapview.lib.style.Style({
        stroke: new _xyz.mapview.lib.style.Stroke({
          color: '#ddd',
          width: 1
        }),
        fill: new _xyz.mapview.lib.style.Stroke({
          color: _xyz.utils.Chroma('#fff').alpha(0.3).rgba()
        })
      })
    });

    zoom.interaction.on('drawend', e => {

      _xyz.mapview.flyToBounds(e.feature.getGeometry().getExtent());

      cancel();
    });

    _xyz.map.addInteraction(zoom.interaction);
  }

  function cancel() {
    finish();
    _xyz.mapview.interaction.highlight.begin();
  }

  function finish() {

    if (zoom.callback) {
      zoom.callback();
      delete zoom.callback;
    }

    _xyz.mapview.node.style.cursor = 'auto';

    _xyz.map.removeInteraction(zoom.interaction);

    _xyz.map.removeLayer(zoom.Layer);

    zoom.Layer.getSource().clear();
  }
}