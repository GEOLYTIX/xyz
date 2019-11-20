export default _xyz => function() {

  const layer = this;

  const xhr = new XMLHttpRequest();

  xhr.open(
    'GET',
    _xyz.host +
          '/api/location/field?' +
          _xyz.utils.paramString({
            locale: _xyz.workspace.locale.key,
            layer: layer.key,
            table: layer.tableCurrent(),
            id: layer.highlight,
            coords: layer.format === 'cluster' && _xyz.mapview.lib.proj.transform(_xyz.mapview.interaction.highlight.feature.getGeometry().getCoordinates(),'EPSG:' + _xyz.mapview.srid,'EPSG:' + layer.srid),
            field: layer.hover.field,
            token: _xyz.token
          }));
    
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
    
  xhr.onload = e => {

    if (e.target.status !== 200) return;
    
    _xyz.mapview.infotip.create(e.target.response.field);
    
  };
    
  xhr.send();
};