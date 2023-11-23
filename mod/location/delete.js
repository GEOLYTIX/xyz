const dbs = require('../utils/dbs')

const workspaceCache = require('../workspace/cache')

module.exports = async (req, res) => {

  const workspace = await workspaceCache()

  const layer = req.params.layer

  // Validate dynamic method call.
  if (typeof dbs[layer.dbs || workspace.dbs] !== 'function') return;

  let rows = await dbs[layer.dbs || workspace.dbs](`
  DELETE FROM ${req.params.table} WHERE ${layer.qID} = $1;`, [req.params.id])

  if (rows instanceof Error) return res.status(500).send('PostgreSQL query error - please check backend logs.')

  res.send('Location delete successful')
}