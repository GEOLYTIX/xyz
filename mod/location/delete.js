const dbs = require('../utils/dbs')()

module.exports = async (req, res) => {

  const layer = req.params.layer

  // Validate dynamic method call.
  if (typeof dbs[layer.dbs || req.params.workspace.dbs] !== 'function') return;

  var rows = await dbs[layer.dbs || req.params.workspace.dbs](`
  DELETE FROM ${req.params.table} WHERE ${layer.qID} = $1;`, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('PostgreSQL query error - please check backend logs.')

  res.send('Location delete successful')
}