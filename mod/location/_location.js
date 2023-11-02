const methods = {
  new: require('./new'),
  get: require('./get'),
  update: require('./update'),
  delete: require('./delete'),
}

const Roles = require('../utils/roles')

const getLayer = require('../workspace/getLayer')

module.exports = async (req, res) => {

  if (!Object.hasOwn(methods, req.params.method)) {
    return res.send(`Failed to evaluate 'method' param.`)
  }

  const layer = await getLayer(req.params)

  if (layer instanceof Error) {
    return res.status(400).send('Failed to access layer.')
  }

  if (!Roles.check(layer, req.params.user?.roles)) {
    return res.status(403).send('Role access denied for layer.')
  }
  
  req.params.layer = layer
 
  return methods[req.params.method](req, res)  
}
