const _format = {
  cluster: require('./cluster'),
  mvt: require('./mvt'),
  geojson: require('./geojson'),
  grid: require('./grid'),
}

module.exports = async (req, res) => {

  const format = _format[req.params.format]

  if (!format) {
    return res.send(`Failed to evaluate 'format' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  const locale = req.params.locale && req.params.workspace.locales[req.params.locale]

  const layer = locale && locale.layers[req.params.layer] ||  req.params.workspace.templates[req.params.layer]

  req.params.layer = layer

  if (!req.params.layer) {
    return res.send(`Failed to evaluate 'layer' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/layer/">Layer API</a>`)
  }

  return format(req, res)

}