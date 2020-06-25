const auth = require('../mod/user/auth')

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

  const workspace = await getWorkspace(req.params.cache)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.cache) return res.send('/location endpoint cache cleared')

  const method = _method[req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }

  const locale = req.params.locale && workspace.locales[req.params.locale]

  const layer = locale && locale.layers[req.params.layer] ||  workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  req.params.layer = layer

  if (!req.params.layer) {
    return res.status().send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }
  
  return method(req, res)
}
