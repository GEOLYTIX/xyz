export default _xyz => () => {

  if (_xyz.mapview.popup.overlay) _xyz.map.removeOverlay(_xyz.mapview.popup.overlay);

  if (!_xyz.mapview.highlight.layer || !_xyz.mapview.highlight.feature) return;

  _xyz.mapview.highlight.layer.select(_xyz.mapview.highlight.feature);

};