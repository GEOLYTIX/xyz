export default _xyz => function (e, feature) {

  const layer = this;
  
  let
    count = feature.get('properties').count,
    geom = feature.getGeometry(),
    coords = geom.getCoordinates(),
    lnglat = _xyz.mapview.lib.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');

  const xhr = new XMLHttpRequest();

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/location/select/cluster?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    table: layer.table,
    filter: JSON.stringify(filter),
    count: count > 99 ? 99 : count,
    lnglat: lnglat,
    token: _xyz.token
  }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';

  xhr.onload = e => {

    if (e.target.status !== 200) return;

    let cluster = e.target.response;

    if (cluster.length > 1) {

      const ul = _xyz.utils.wire()`<ul class="scroll-list">`;

      cluster.forEach(li => {

        ul.appendChild(_xyz.utils.wire()`<li onclick=${() => _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          id: li.id,
          marker: li.lnglat,
          edit: layer.edit
        })}>${li.label}`);

      });

      _xyz.mapview.popup.create({
        xy: coords,
        content: ul
      });

      return;

    }

    if (cluster.length === 1) return _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.table,
      id: cluster[0].id,
      marker: cluster[0].lnglat,
      edit: layer.edit
    });

  };

  xhr.send();

};