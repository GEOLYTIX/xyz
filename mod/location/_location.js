const methods = new Map()

methods.set('new', require('./new'))
methods.set('get', require('./get'))
methods.set('update', require('./update'))
methods.set('delete', require('./delete'))

module.exports = async (req, res) => {

  const method = methods.get(req.params.method)

  if (typeof method !== 'function') {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }

  const locale = req.params.locale && req.params.workspace.locales[req.params.locale]

  const layer = locale && locale.layers[req.params.layer] ||  req.params.workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  req.params.layer = layer

  if (!req.params.layer) {
    return res.status(400).send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/location/">Location API</a>`)
  }
  
  return method(req, res)
  
}
