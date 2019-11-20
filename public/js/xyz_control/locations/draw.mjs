export default _xyz => function (style) {

  if (!_xyz.map) return;

  const location = this;

  location.Layer = _xyz.geom.geoJSON({
    json: {
      type: 'Feature',
      geometry: location.geometry,
    },
    pane: (style && style.pane) || 'select',
    style: style || location.style,
  });

};