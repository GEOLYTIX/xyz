const dbs = require('../dbs')()

const fs = require('fs');

const sql_filter = require('./sql_filter')

module.exports = async (req, res) => {

	const layer = req.params.layer;

	const viewport = req.params.viewport ? req.params.viewport.split(',') : null;

	const fields = layer.infoj
    .filter(entry => !req.params.fields || (req.params.fields && req.params.fields.split(',').includes(entry.field)))
    .filter(entry => !entry.query)
    .filter(entry => entry.type !== 'key')
    .filter(entry => entry.type !== 'dataview')
    .filter(entry => entry.type !== 'geometry')
    .filter(entry => entry.field)
    .map(entry => {
      if (entry.labelfx) return `${entry.labelfx} AS ${entry.field}_label`
      if (entry.field) return `(${entry.fieldfx || entry.field}) AS ${entry.field}`
    })

    const roles = layer.roles
    && req.params.token
    && Object.keys(layer.roles)
      .filter(key => req.params.token.roles.includes(key))
      .reduce((obj, key) => {
        obj[key] = layer.roles[key];
        return obj;
      }, {});

  !req.params.fields && fields.push(`ST_asGeoJson(${layer.geom}, 4) AS geomj`);

  const where_sql = viewport ? `
  AND
  ST_Intersects(
    ST_Transform(ST_MakeEnvelope(
      ${viewport[0]},
      ${viewport[1]},
      ${viewport[2]},
      ${viewport[3]},
      ${parseInt(viewport[4])}
    ), ${layer.srid}),
    ${layer.geom})` : '';

  const filter = `
  ${req.params.filter
    && await sql_filter(Object.entries(JSON.parse(req.params.filter)).map(e => ({[e[0]]:e[1]})))
    || ''}
  ${roles && Object.values(roles).some(r => !!r)
    && await sql_filter(Object.values(roles).filter(r => !!r), 'OR')
    || ''}`

  var q = `SELECT
  ${fields.join()}
  FROM ${req.params.table}
  WHERE true ${filter} ${req.query.viewport ? where_sql : ''};`

  var rows = await dbs[layer.dbs](q)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  rows = rows.map(row => {

  	let feature = {
  		type: "Feature",
  		properties: {},
  		geometry: {}
  	};

  	feature.geometry = JSON.parse(row.geomj);

  	feature.properties = Object.assign({}, row);

  	delete feature.properties.geomj;

  	return feature;

  });

  var buf = Buffer.from(JSON.stringify({type: "Feature Collection", features: rows}));

  res.end(buf);
}