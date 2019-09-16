export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const allLayer = [];

  if (location.Layer) allLayer.push(location.Layer);

  if (location.Marker) allLayer.push(location.Marker);

  location.geometries.forEach(layer => allLayer.push(layer));

  allLayer.push(_xyz.mapview.locate.L);

  _xyz.mapview.flyToBounds(allLayer);

};