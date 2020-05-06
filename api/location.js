const auth = require('../mod/auth/handler')

const getWorkspace = require('../mod/workspace/getWorkspace')

const _method = {
  new: require('../mod/location/new'),
  get: require('../mod/location/get'),
  update: require('../mod/location/update'),
  delete: require('../mod/location/delete'),
}

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  await auth(req, res)

  if (res.finished) return

  const workspace = await getWorkspace(req.params.clear_cache)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.clear_cache) return res.send('/location endpoint cache cleared')

  const method = _method[req.params.method]

  if (!method) return res.send('Help text.')

  req.params.layer = req.params.locale && workspace.locales[req.params.locale].layers[req.params.layer]

  if (!req.params.layer) return res.send('Help text.')
  
  return method(req, res)
}
