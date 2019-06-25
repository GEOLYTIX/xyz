export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const allLayer = [location.Layer];

  location.geometries.forEach(layer => allLayer.push(layer));

  allLayer.push(_xyz.mapview.locate.L);

  _xyz.mapview.lib.flyToBounds(allLayer);

};