export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const sourceVector = new _xyz.mapview.lib.source.Vector();

  if (location.Layer) sourceVector.addFeatures(location.Layer.getSource().getFeatures());

  if (location.Marker) sourceVector.addFeatures(location.Marker.getSource().getFeatures());

  location.geometries.forEach(layer => sourceVector.addFeatures(layer.getSource().getFeatures()));

  _xyz.mapview.flyToBounds(sourceVector.getExtent());

};