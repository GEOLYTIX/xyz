export default _xyz => function(feature) {

  const layer = this;

  _xyz.locations.select({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.tableCurrent(),
    id: feature.get('id'),
  });

};