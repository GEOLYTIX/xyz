export default _xyz => function (style) {

  if (!_xyz.map) return;

  const location = this;

  location.style.zIndex = 20;

  location.Layer = _xyz.mapview.geoJSON({
    json: {
      type: 'Feature',
      geometry: location.geometry,
    },
    pane: (style && style.pane) || 'select',
    style: style || location.style,
    dataProjection: _xyz.layers.list[location.layer].srid,
    featureProjection: '3857'
  });

  //_xyz.map.addLayer(location.Layer);

};