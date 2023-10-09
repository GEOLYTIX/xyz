const dbs = require('../utils/dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  const fields = Object.entries(req.body)
    .map(entry => {

      if (entry[1] === null) {

        // Value is null
        return ` ${entry[0]} = null`
      }

      if (typeof entry[1] === 'string') {

        // Value is string. Escape quotes.
        return ` ${entry[0]} = '${entry[1].replace(/\'/gi, `''`)}'`
      }

      if (entry[1].coordinates) {
        
        // Value is geometry.
        return ` ${entry[0]} = ST_SetSRID(ST_MakeValid(ST_GeomFromGeoJSON('${JSON.stringify(entry[1])}')),${layer.srid})`
      }

      if (Array.isArray(entry[1])) {

        // Value is an array (of strings)
        return ` ${entry[0]} = ARRAY['${entry[1].join("','")}']`
      }

      if (typeof entry[1] === 'object') {
       
        // Value is an object and must be stringified.
        return ` ${entry[0]} = '${JSON.stringify(entry[1])}'`
      }

      if (typeof entry[1] === 'boolean' || typeof entry[1] === 'number') {

        // Value is boolean or number.
        return ` ${entry[0]} = ${entry[1]}`
      }
    })

  // Validate dynamic method call.
  if (!Object.hasOwn(dbs, layer.dbs || req.params.workspace.dbs) || typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;    

  var q = `UPDATE ${req.params.table} SET ${fields.join()} WHERE ${layer.qID} = $1;`

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](q, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('PostgreSQL query error - please check backend logs.')

  res.send('This is fine.')
}