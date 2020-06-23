export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const sourceVector = new ol.source.Vector();

  if (location.Layer) sourceVector.addFeatures(location.Layer.getSource().getFeatures());

  if (location.Marker) sourceVector.addFeatures(location.Marker.getSource().getFeatures());

  location.geometries.forEach(layer => {
  	layer.length ? layer.forEach(l => sourceVector.addFeatures(l.getSource().getFeatures())) : sourceVector.addFeatures(layer.getSource().getFeatures());
  });

  _xyz.mapview.flyToBounds(sourceVector.getExtent());

};