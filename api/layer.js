const auth = require('../mod/auth/handler')

const getWorkspace = require('../mod/workspace/getWorkspace')

const _format = {
  cluster: require('../mod/layer/cluster'),
  mvt: require('../mod/layer/mvt'),
  geojson: require('../mod/layer/geojson'),
  grid: require('../mod/layer/grid'),
}

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  await auth(req, res)

  if (res.finished) return

  const workspace = await getWorkspace(req.params.clear_cache)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.clear_cache) return res.send('/layer endpoint cache cleared')

  const format = _format[req.params.format]

  if (!format) {
    return res.send(`Failed to evaluate 'format' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  const locale = req.params.locale && workspace.locales[req.params.locale]

  const layer = locale && locale.layers[req.params.layer] ||  workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  req.params.layer = layer

  if (!req.params.layer) {
    return res.status().send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  return format(req, res)
}