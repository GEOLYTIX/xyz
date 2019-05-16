export default _xyz => () => {

  const z = _xyz.map.getZoom();

  if (_xyz.mapview.btn.ZoomIn && !(z < _xyz.workspace.locale.maxZoom)) {
    _xyz.mapview.btn.ZoomIn.disabled = true;
  }

  if (_xyz.mapview.btn.ZoomOut && !(z > _xyz.workspace.locale.minZoom)) {
    _xyz.mapview.btn.ZoomOut.disabled = true;
  }
           
  // Set view hooks when method is available.
  if (_xyz.hooks) {
    const center = _xyz.map.getCenter();

    _xyz.hooks.set({
      lat: center.lat,
      lng: center.lng,
      z: z
    });
  }

  _xyz.tableview.current_table && _xyz.tableview.current_table.viewport && _xyz.tableview.current_table.update();
          
  // Reload layers.
  // layer.get() will return if reload is not required.
  Object.values(_xyz.layers.list).forEach(layer => layer.get());
};