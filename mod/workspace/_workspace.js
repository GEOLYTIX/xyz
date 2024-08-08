/**
## /workspace
The Workspace API module exports the getKeyMethod() which returns a method from the keyMethods{} object.

- layer
- locale
- locales
- roles

@requires /utils/roles
@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getLayer

@module /workspace
*/

const Roles = require('../utils/roles')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getLayer = require('./getLayer')

const keyMethods = {
  layer,
  locale,
  locales,
  roles,
}

let workspace;

/**
@function getKeyMethod
@async

@description
The cached workspace requested from the workspaceCache() will be assigned to the workspace variable declared in the module scope.

The method checks whether the req.params.key matches a keyMethods property and returns the matching method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} params.key Workspace API method requested.
*/
module.exports = async function getKeyMethod(req, res) {

  workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return res.status(500).send('Failed to load workspace.')
  }

  // The keys object must own a user provided lookup key
  if (!Object.hasOwn(keyMethods, req.params.key)) {

    return res.status(400).send(`Failed to evaluate '${req.params.key}' param.`)
  }

  return keyMethods[req.params.key](req, res)
}

/**
@function layer
@async

@description
The method requests a JSON layer from the getLayer module.

Role objects in the layer are merged with their respective parent objects.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Locale key.
@property {boolean} [params.layer] Layer key.
@property {Object} [params.user] User requesting the layer.

@returns {res} The HTTP response with either an error.message or the JSON layer.
*/
async function layer(req, res) {

  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {

    req.params.user.roles.push('*')
  }

  let layer = await getLayer(req.params)

  if (layer instanceof Error) {
    return res.status(400).send(layer.message)
  }

  layer = Roles.objMerge(layer, req.params.user?.roles)

  res.json(layer)
}

/**
@function locales

@description
The locales method reduces the workspace.locales{} object to an array locales with only the key and name properties.

The locales are not merged with templates and only roles defined inside the workspace.locales{} locale object are considered for access.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {Object} [params.user] User requesting the locales.

@returns {res} The HTTP response with either an error.message or JSON array of locales in workspace.
*/
function locales(req, res) {

  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {

    req.params.user.roles.push('*')
  }

  const locales = Object.values(workspace.locales)
    .filter(locale => !!Roles.check(locale, req.params.user?.roles))
    .map(locale => ({
      key: locale.key,
      name: locale.name
    }))

  res.send(locales)
}

/**
@function locale
@async

@description
The method requests a JSON locale from the getLocale module.

All locale layers are requested from the getLayer module with `params.layers` flag.

Role objects in the locale and nested layers are merged with their respective parent objects.

The locale.layers{} object is reduced to an array of layer keys without the `params.layers` flag.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request params.
@property {string} [params.locale] Locale key.
@property {boolean} [params.layers] Whether layer objects should be returned with the locale.
@property {Object} [params.user] User requesting the locale.

@returns {res} The HTTP response with either an error.message or the JSON locale.
*/
async function locale(req, res) {

  // Add default role * to all users.
  if (Array.isArray(req.params.user?.roles)) {

    req.params.user.roles.push('*')
  }

  let locale = await getLocale(req.params)

  if (locale instanceof Error) {
    return res.status(400).send(locale.message)
  }

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

        // The getLayer method will return an Error if role access is prevented.
        .filter(layer => !(layer instanceof Error))
    })

    locale = Roles.objMerge(locale, req.params.user?.roles)

    return res.json(locale)
  }

  locale = Roles.objMerge(locale, req.params.user?.roles)
  
  // Check layer access.
  locale.layers = locale.layers && Object.entries(locale.layers)

    // filter layers which are null
    .filter(layer => layer[1] !== null)

    // check layer for user roles
    .filter(layer => !!Roles.check(layer[1], req.params.user?.roles))
    .map(layer => layer[0])

  res.json(locale)
}

function roles(req, res) {

  if (!workspace.locales) return res.send({})

  let roles = Roles.get(workspace)

  res.send(roles)
}
