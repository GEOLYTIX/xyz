export default _xyz => function () {

  if (!_xyz.map) return;

  const location = this;

  const allLayer = [];

  if (location.Layer) allLayer.push(location.Layer);

  if (location.Marker) allLayer.push(location.Marker);

  location.geometries.forEach(layer => allLayer.push(layer));

  if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) allLayer.push(_xyz.mapview.locate.L);

  _xyz.map.flyToBounds(_xyz.L.featureGroup(allLayer).getBounds(),{
    padding: [25, 25]
  });

};