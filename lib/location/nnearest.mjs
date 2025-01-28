/**
## /location/nnearest

The module exports a utility method for the nnearest query template.

@requires /utils/xhr
@module /location/nnearest
*/

/**
@function nnearest

@description
The nnearest method gets coordinates from a feature geometry passed in the params argument.

A parameterised query to the get_nnearest template will be sent. The n for the nearest records query param is implied by the count property value of a cluster feature.

The records returned from the query are presented in a list popup positioned on the feature geometry.

Clicking on a list element allows to get the location associated with the query response record.

@param {object} params Parameter for the nnearest location query.
@property {mapview} params.mapview The mapview for locations layer.
@property {layer} params.later The locations layer.
@property {object} params.feature Query records nnearest to the feature.geometry.
@property {string} params.table The database table for the query.
*/
export default async function nnearest(params) {
  const featureProperties = params.feature.getProperties();

  const fGeom = params.feature.getGeometry();
  const fCoord = fGeom.getCoordinates();
  const coords = ol.proj.transform(
    fCoord,
    `EPSG:${params.mapview.srid}`,
    `EPSG:${params.layer.srid}`,
  );

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
        n:
          featureProperties.count > (params.max || 99)
            ? params.max || 99
            : featureProperties.count,
        x: coords[0],
        y: coords[1],
        coords: coords,
      }),
  );

  const list = response.map(
    (li) => mapp.utils.html.node`<li 
    onclick=${(e) => {
      params.mapview.popup(null);
      mapp.location.get({
        layer: params.layer,
        table: params.table,
        id: li.id,
        marker: ol.proj.transform(
          li.coords,
          'EPSG:' + params.layer.srid,
          'EPSG:' + params.mapview.srid,
        ),
      });
    }}>${li.label || '"' + params.layer.cluster?.label + '"'}`,
  );

  const content = mapp.utils.html.node`<ul class="list">${list}`;

  params.mapview.popup({
    coords: ol.proj.transform(
      coords,
      'EPSG:' + params.layer.srid,
      'EPSG:' + params.mapview.srid,
    ),
    autoPan: true,
    content,
  });
}
