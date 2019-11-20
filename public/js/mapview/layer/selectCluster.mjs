export default _xyz => function(feature) {

  const layer = this;
  
  let
    count = feature.get('properties').count,
    geom = feature.getGeometry(),
    _coords = geom.getCoordinates(),
    coords = _xyz.mapview.lib.proj.transform(
      _coords,
      'EPSG:' + _xyz.mapview.srid,
      'EPSG:' + layer.srid);

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    filter: JSON.stringify(filter),
    count: count > 99 ? 99 : count,
    coords: coords,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    let cluster = e.target.response;

    if (cluster.length > 1) {

      const ul = _xyz.utils.wire()`
      <ul>
      ${cluster.map(
        li => _xyz.utils.wire()`
        <li class="secondary-colour-hover" onclick=${
          () => _xyz.locations.select({
            locale: _xyz.workspace.locale.key,
            layer: layer,
            table: layer.table,
            id: li.id,
            marker: li.coords,
          })
        }>${li.label || '"' + layer.cluster_label + '"'}`)}`;

      _xyz.mapview.popup.create({
        coords: _xyz.mapview.lib.proj.transform(
          coords,
          'EPSG:' + layer.srid,
          'EPSG:' + _xyz.mapview.srid),
        content: ul
      });

      return;

    }

    if (cluster.length === 1) return _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: layer,
      table: layer.table,
      id: cluster[0].id,
    });

  };

  xhr.send();

};