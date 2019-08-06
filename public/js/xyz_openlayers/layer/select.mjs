export default _xyz => function(e, feature) {

  _xyz.locations.select({
    locale: _xyz.workspace.locale.key,
    layer: this.key,
    table: this.table,
    id: feature.get('id'),
    marker: _xyz.mapview.lib.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'),
    edit: this.edit
  });

};