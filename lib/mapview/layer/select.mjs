export default _xyz => function(feature, pixel) {

  const id = typeof feature === 'object' && feature.get('id') || feature

  const layer = this;

  _xyz.locations.select({
    locale: _xyz.locale.key,
    layer: layer,
    table: layer.tableCurrent(),
    id: id,
    pixel: pixel
  });

};