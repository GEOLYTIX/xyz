const dbs = require('../dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  const fields = layer.infoj
    .filter(entry => !req.params.fields || (req.params.fields && req.params.fields.split(',').includes(entry.field)))
    .filter(entry => !entry.query)
    .filter(entry => entry.type !== 'key')
    .filter(entry => entry.field)
    .map(entry => {
      if (entry.labelfx) return `${entry.labelfx} AS ${entry.field}_label`
      if (entry.field) return `(${entry.fieldfx || entry.field}) AS ${entry.field}`
    })

  !req.params.fields && fields.push(`ST_asGeoJson(${layer.geom}, 4) AS geomj`)

  var q = `
  SELECT
    ${fields.join()}
  FROM ${req.params.table}
  WHERE ${layer.qID} = $1`

  var rows = await dbs[layer.dbs](q, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (rows.length === 0) return res.status(202).send('No rows returned from table.')

  if (req.params.fields) return res.send(rows[0])

  const location = {
    geometry: JSON.parse(rows[0].geomj)
  }

  delete rows[0].geomj

  location.properties = rows[0]

  // Send the infoj object with values back to the client.
  res.send(location)

}