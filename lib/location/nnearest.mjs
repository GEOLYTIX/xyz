/**
## mapp.location.nnearest()
@module /location/nnearest

@param {Object} params
*/

export default async function (params) {

  let
    properties = params.feature.getProperties(),
    geom = params.feature.getGeometry(),
    _coords = geom.getCoordinates(),
    coords = ol.proj.transform(
      _coords,
      'EPSG:' + params.mapview.srid,
      'EPSG:' + params.layer.srid)

  const response = await mapp.utils.xhr(
    `${params.mapview.host}/api/query/get_nnearest?` +
      mapp.utils.paramString({
        locale: params.mapview.locale.key,
        layer: params.layer.key,
        geom: params.layer.geom,
        qID: params.layer.qID,
        label: params.layer.cluster?.label || params.layer.qID,
        table: params.table,
        filter: params.layer.filter?.current,
        n: properties.count > (params.max || 99) ? (params.max || 99) : properties.count,
        x: coords[0],
        y: coords[1],
        coords: coords,
      })
  );

  const list = mapp.utils.html.node`
    <div style="max-width: 66vw; max-height: 300px; overflow-x: hidden;">
      <ul>
      ${response.map(li => mapp.utils.html.node`
        <li
          onclick=${e => {
            params.mapview.popup(null)
            mapp.location.get({
              //mapview: params.mapview,
              layer: params.layer,
              table: params.table,
              id: li.id,
              marker: ol.proj.transform(
                li.coords,
                'EPSG:' + params.layer.srid,
                'EPSG:' + params.mapview.srid),
            })
          }}>${li.label || '"' + params.layer.cluster?.label + '"'}`)}`;

  params.mapview.popup({
    coords: ol.proj.transform(
      coords,
      'EPSG:' + params.layer.srid,
      'EPSG:' + params.mapview.srid
    ),
    content: list,
    autoPan: true,
  });

}