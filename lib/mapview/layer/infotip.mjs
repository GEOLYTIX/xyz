export default _xyz => function() {

  const layer = this;

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/query/infotip?' +
    _xyz.utils.paramString({
      locale: _xyz.locale.key,
      layer: layer.key,
      geom: layer.geom,
      qID: layer.qID,
      table: layer.tableCurrent(),
      id: layer.highlight,
      coords: layer.format === 'cluster' && ol.proj.transform(_xyz.mapview.interaction.highlight.feature.getGeometry().getCoordinates(), 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid),
      field: layer.hover.field
    }));
    
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
    
  xhr.onload = e => {

    if (e.target.status !== 200) return;
    
    _xyz.mapview.infotip.create(e.target.response.label);
    
  };
    
  xhr.send();
};