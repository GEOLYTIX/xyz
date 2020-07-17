export default _xyz => function(feature) {

  const layer = this;
  
  let
    count = feature.get('properties').count,
    geom = feature.getGeometry(),
    _coords = geom.getCoordinates(),
    coords = ol.proj.transform(
      _coords,
      'EPSG:' + _xyz.mapview.srid,
      'EPSG:' + layer.srid);

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/query/get_nnearest?' +
    _xyz.utils.paramString({
      locale: _xyz.locale.key,
      layer: layer.key,
      table: layer.tableCurrent(),
      filter: layer.filter && JSON.stringify(layer.filter.current),
      n: count > 99 ? 99 : count,
      coords: coords
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status >= 300) return;

    let cluster = e.target.response;

    if (cluster && cluster.length > 1) {

      const list = _xyz.utils.wire()`
      <div style="
        width: 400px;
        max-width: 75vw;
        max-height: 300px;
        overflow-x: hidden;">
      <ul>
      ${cluster.map(
        li => _xyz.utils.wire()`
        <li
          style="padding: 5px 0 5px 10px; white-space: nowrap; line-height: 1.5;"
          class="secondary-colour-hover"
          onclick=${
          () => _xyz.locations.select({
            locale: _xyz.locale.key,
            layer: layer,
            table: layer.tableCurrent(),
            id: li.id,
            marker: li.coords,
          })
        }>${li.label || '"' + layer.cluster_label + '"'}`)}`;

      _xyz.mapview.popup.create({
        coords: ol.proj.transform(
          coords,
          'EPSG:' + layer.srid,
          'EPSG:' + _xyz.mapview.srid),
        content: list,
        autoPan: true
      });

      return;

    }

    return _xyz.locations.select({
      locale: _xyz.locale.key,
      layer: layer,
      table: layer.tableCurrent(),
      id: cluster.id,
    });

  };

  xhr.send();

};