export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const allLayer = [location.Layer];

  location.geometries.forEach(layer => allLayer.push(layer));

  if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) allLayer.push(_xyz.mapview.locate.L);

  _xyz.map.flyToBounds(_xyz.mapview.lib.featureGroup(allLayer).getBounds(),{
    padding: [25, 25]
  });

};