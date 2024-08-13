/**
### Workspace API

The workspace module exports the Workspace API endpoint to request JSON objects from the workspace.

@module /workspace

@requires /utils/roles
@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getLayer
*/

const Roles = require('../utils/roles')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getLayer = require('./getLayer')

let workspace;

/**
@function workspace_api

@description

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} [req.body] 
HTTP Post request body containing the update information.
@property {Object} req.params 
HTTP request parameter.
@property {Boolean} params.detail 
Whether the roles should be returned as an object with details.

@returns {Array|Object} Returns either an array of roles as string, or an object with roles as properties.
*/
module.exports = async function workspace_api (req, res) {

  workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return res.status(500).send('Failed to load workspace.')
  }

  const keys = {
    layer,
    locale,
    locales,
    roles,
  }

  // The keys object must own a user provided lookup key
  if (!Object.hasOwn(keys, req.params.key)) {

    return res.status(400).send(`Failed to evaluate '${req.params.key}' param.`)
  }

  return keys[req.params.key](req, res)
}

async function layer(req, res) {

  if (!Object.hasOwn(workspace.locales, req.params.locale)) {
    return res.status(400).send(`Unable to validate locale param.`)
  }

  const locale = workspace.locales[req.params.locale]

  const roles = req.params.user?.roles || []
  
  roles.push('*')

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied for locale.')
  }

  if (!Object.hasOwn(locale.layers, req.params.layer)) {
    return res.status(400).send(`Unable to validate layer param.`)
  }

  let layer = await getLayer(req.params)

  if (!Roles.check(layer, roles)) {
    return res.status(403).send('Role access denied for layer.')
  }

  layer = Roles.objMerge(layer, roles)

  res.json(layer)
}

function locales(req, res) {

  const locales = Object.values(workspace.locales)
    .filter(locale => !!Roles.check(locale, req.params.user?.roles))
    .map(locale => ({
      key: locale.key,
      name: locale.name
    }))

  res.send(locales)
}

async function locale(req, res) {

  if (req.params.locale && !Object.hasOwn(workspace.locales, req.params.locale)) {
    return res.status(400).send(`Unable to validate locale param.`)
  }

  let locale;

  if (Object.hasOwn(workspace.locales, req.params.locale)) {

    locale = await getLocale(req.params)

  } else if (typeof workspace.locale === 'object') {

    locale = workspace.locale
  }

  if (locale instanceof Error) {
    return res.status(400).send(locale.message)
  }
  
  // Subtitutes ${*} with process.env.SRC_* key values.
  locale = JSON.parse(
    JSON.stringify(locale).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/(^\${)|(}$)/g, '')}`])
  )

  const roles = req.params.user?.roles || []
  
  roles.push('*')

  // Return layer object instead of array of layer keys
  if (req.params.layers) {

    const layers = Object.keys(locale.layers)
      .map(async key => await getLayer({
        ...req.params,
        layer: key
      }))

    await Promise.all(layers).then(layers=>{

      locale.layers = layers
        .filter(layer => !!layer)
        .filter(layer => !(layer instanceof Error))
        .filter(layer => Roles.check(layer, roles))
    })

    // Also merges roles in layer objects.
    locale = Roles.objMerge(locale, roles)

    return res.json(locale)
  }

  locale = Roles.objMerge(locale, roles)
  
  // Check layer access.
  locale.layers = locale.layers && Object.entries(locale.layers)

    // filter layers which are null
    .filter(layer => layer[1] !== null)

    // check layer for user roles
    .filter(layer => !!Roles.check(layer[1], roles))
    .map(layer => layer[0])

  res.json(locale)
}

/**
@function roles

@description
The roles method returns an array of roles returned from the roles utility.

An object with detailed workspace.roles{} can be requested with the `detail=true` url parameter for the workspace/roles request.

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} req.params 
HTTP request parameter.
@property {Boolean} params.detail 
Whether the roles should be returned as an object with details.

@returns {Array|Object} Returns either an array of roles as string, or an object with roles as properties.
*/
function roles(req, res) {

  const rolesSet = new Set();

  (function objectEval(o, parent, key) {

    if (key === 'roles') {
      Object.keys(parent.roles).forEach(role => {

        // Add role without negation ! to roles set.
        // The same role can not be added multiple times to the rolesSet.
        rolesSet.add(role.replace(/^!/, ''))
      })
    }

    // Iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') {

        // Call method recursive for nested objects.
        objectEval(o[key], o, key)
      }
    });

  })(workspace)

  // Delete restricted Asterisk role.
  rolesSet.delete('*')

  const roles = Array.from(rolesSet)

  // If detail=true, return workspace.roles{} object (so you can specify information for each role).
  if(req.params.detail) {

    workspace.roles ??= {}

    // If the role is missing, add it to the workspace.roles{} object as an empty object.
    roles
      .filter(role => !Object.hasOwn(workspace.roles, role))
      .forEach(role => workspace.roles[role] = {})

    // Return the workspace.roles{} object.
    return res.send(workspace.roles)
  }

  res.send(roles)
}
