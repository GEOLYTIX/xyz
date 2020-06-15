const auth = require('../mod/auth/handler')

const defaults = require('../mod/workspace/defaults')

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

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }

  const locale = req.params.locale && workspace.locales[req.params.locale]

  let layer = locale && locale.layers[req.params.layer] ||  workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  layer.template && Object.assign(layer, workspace.templates[layer.template])

  layer = Object.assign({key: req.params.layer}, defaults.layers[layer.format] || {}, layer)

  layer.style = layer.style && Object.assign({}, defaults.layers[layer.format].style || {}, layer.style)

  req.params.layer = layer

  if (!req.params.layer) {
    return res.status().send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }
  
  return method(req, res)
}
