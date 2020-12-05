export default _xyz => function(feature, pixel) {

  const layer = this;

  _xyz.locations.select({
    locale: _xyz.locale.key,
    layer: layer,
    table: layer.tableCurrent(),
    id: feature.get('id'),
    pixel: pixel
  });

};