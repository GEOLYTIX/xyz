export default _xyz => function(geom){

  const gazetteer = this;

  // Parse json if geom is string
  geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;

  // Remove existing layer.
  if (gazetteer.layer) _xyz.map.removeLayer(gazetteer.layer);
  
  gazetteer.layer = _xyz.mapview.geoJSON({
    geometry: geom,
    dataProjection: '4326',
    style: new _xyz.mapview.lib.style.Style({
      image: _xyz.mapview.icon(gazetteer.icon)
    })
  });

  _xyz.mapview.flyToBounds(gazetteer.layer.getSource().getExtent());

};