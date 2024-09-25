/**
## /workspace
The Workspace API module exports the getKeyMethod() which returns a method from the keyMethods{} object.

- layer
- locale
- locales
- roles

The workspace typedef object has templates, locale, locales, dbs, and roles properties. The workspace will be cached in the process by the workspace/cache module.

@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getLayer
@requires /utils/roles

@module /workspace
*/

/**
@global
@typedef {Object} workspace
The workspace object defines the mapp resources available in an XYZ instance.
@property {Object} [roles] Each property of the roles object is a role which can be assigned to a user.
@property {string} [dbs] The fallback dbs connection if not implicit in [query] template.
@property {Object} locale The default locale which serves as a templates for all locales in workspace.
@property {Object} locales Each property in the locales object is a locale available from this workspace.
*/

const Roles = require('../utils/roles')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getLayer = require('./getLayer')

const getTemplate = require('./getTemplate')

const keyMethods = {
  layer,
  locale,
  locales,
  roles,
  test,
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

    await Promise.all(layers).then(layers => {

      locale.layers = layers
        .filter(layer => !!layer)

        // The getLayer method will return an Error if role access is prevented.
        .filter(layer => !(layer instanceof Error))
    })

    return res.json(locale)
  }

  // Check layer access.
  locale.layers = locale.layers && Object.entries(locale.layers)

    // filter layers which are null
    .filter(layer => layer[1] !== null)

    // check layer for user roles
    .filter(layer => !!Roles.check(layer[1], req.params.user?.roles))
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
  if (req.params.detail) {

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

/**
@function test

@description
The workspace/test method which is only available to user with admin credentials requests all locales in workspace.

Requesting all locales should add any additional templates to the workspace.

The test method will iterate over all workspace.templates and get from the getTemplate method to check whether any errors are logged on a template in regards to its src parameter.

A flat array of template.err will be returned from the workspace/test method.

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} req.params 
HTTP request parameter.
@property {Object} params.user 
The user requesting the test method.
@property {Boolean} user.admin
The user is required to have admin priviliges.
*/
async function test(req, res) {

  if (!req.params.user?.admin) {
    res.status(403).send(`Admin credentials are required to test the workspace sources.`)
    return
  }

  const testResults = {};
  const errArr = []
  let custom_templates = {};
  let templateUsage = {};

  for (const localeKey of Object.keys(workspace.locales)) {

    // Will get layer and assignTemplates to workspace.
    const locale = await getLocale({ locale: localeKey, user: req.params.user })

    custom_templates = {
      ...Object.fromEntries(
        Object.entries(workspace.templates).filter(([key, value]) => value._type === 'workspace_template')
      )
    };

    for (const layerKey of Object.keys(locale.layers)) {

      // Will get layer and assignTemplates to workspace.
      const layer = await getLayer({ locale: localeKey, layer: layerKey, user: req.params.user })

      if (layer.template) {
        update_templateUsage(layer.template, custom_templates, templateUsage);
      }

      layer.templates?.forEach(template => {
        update_templateUsage(template, custom_templates, templateUsage);
      });

      if (layer.err) errArr.push(`${layerKey}: ${layer.err}`)
    }

  }

  //Finding the unused templates from the custom_template where we don't see any count in the templateUsage object.
  const unused_templates = Object.keys(custom_templates).filter(template => !Object.keys(templateUsage).includes(template))

  //Adding the results to the testResults object.
  testResults.usage = templateUsage;
  testResults.unused_templates = unused_templates;

  // From here on its 🐢 Templates all the way down.
  for (const key of Object.keys(workspace.templates)) {

    const template = await getTemplate(key)

    if (template.err) errArr.push(`${key}: ${template.err.path}`)
  }

  testResults.errors = errArr.flat();

  res.setHeader('content-type', 'application/json');

  res.send(JSON.stringify(testResults));
}

/**
@function update_templateUsage

@description
Checks how many times a custom_template is used by layers.

@param {string||object} template The template maybe a string or an object.
@param {Object} custom_templates An object of _type='workspace_template' templates.
@param {Object} templateUsage Also an object of _type='workspace_template' templates with an added count property.
*/
function update_templateUsage(template, custom_templates, templateUsage) {

  // We set a template_key based on if the template is a string or an object.
  const template_key = typeof template === 'string' ? template : template.key;

  // Get the template from the workspace.templates
  const workspace_template = custom_templates[template_key];

  // If we get the template and have a key, then we will increase the usage counter.
  if (template_key && workspace_template) {

    if (templateUsage[templateKey]) {

      // Increase counter for existing templateKey in templateUsage.
      templateUsage[templateKey].count++;

    } else {

      // Create templateKey in templateUsage with count 1.
      templateUsage[templateKey] = { count: 1 };
    }
  }
}
