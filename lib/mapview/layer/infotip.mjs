export default _xyz => function() {

  const layer = this;

  _xyz.query({
    locale: _xyz.locale.key,
    layer: layer.key,
    queryparams: {
      template: layer.hover.query || 'infotip',
      qID: layer.qID,
      id: layer.highlight,
      table: layer.tableCurrent(),
      geom: layer.geom,
      field: layer.hover.field,
      coords: layer.format === 'cluster'
        && ol.proj.transform(_xyz.mapview.interaction.highlight.feature.getGeometry().getCoordinates(), 'EPSG:' + _xyz.mapview.srid, 'EPSG:' + layer.srid)
    }
  }).then(response => {
     if(!response) return
     if(response.label == '') return
    _xyz.mapview.infotip.create(response.label);
  })

};