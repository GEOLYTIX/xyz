/**
## /workspace/cache
The module exports the cacheWorkspace method which returns a workspace from the module scope cache variable or call the cacheWorkspace method to cache the workspace.

Default templates can be overwritten in the workspace or by providing a CUSTOM_TEMPLATES environment variable which references a JSON with templates to be merged into the workspace.

@requires /provider/getFrom
@requires /utils/merge
@requires mapp_env

@module /workspace/cache
*/

const env = require('../../mapp_env.js')

const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

let cache = null

let timestamp = Infinity

const logger = require('../utils/logger')

/**
@function checkWorkspaceCache

@description
The method checks whether the module scope variable cache has been populated.

The timestamp set by cacheWorkspace is checked against the current time. The [workspace] cache will be invalidated if the difference exceeds the WORKSPACE_AGE environment variable.

Setting the WORKSPACE_AGE to 0 is not recommended as this could cause the cache to be flushed while a request is passed through the XYZ API. A layer query processed by the [Query API module]{@link module:/query~layerQuery} will request the layer and associated locale which could be defined in remote templates. Each request to the [Workspace API getTemplate]{@link module:/workspace/getTemplate~getTemplate} method for the locale, layer, and query templates will call the checkWorkspaceCache method which will cause the workspace to be flushed and templates previously cached from their src no longer available.

The cacheWorkspace method is called if the cache is invalid.

@param {Boolean} [force] The workspace cache will be cleared with the force param flag.

@returns {workspace} JSON Workspace.
*/
module.exports = function checkWorkspaceCache(force) {

  if (force) {

    // Reset the cache with force flag.
    cache = null
  }

  // cache is null on first request for workspace.
  // cacheWorkspace is async and must be awaited.
  if (!cache) return cacheWorkspace()

  // cacheWorkspace will set the current timestamp
  // and cache workspace outside export closure prior to returning workspace.  
  if ((Date.now() - timestamp) > +env.WORKSPACE_AGE) {

    // current time minus cached timestamp exceeds WORKSPACE_AGE
    cache = null

    return cacheWorkspace()
  }

  return cache
}

const view_templates = require('./templates/_views')

const mail_templates = require('./templates/_mails')

const msg_templates = require('./templates/_msgs')

const query_templates = require('./templates/_queries')

const workspace_src = env.WORKSPACE?.split(':')[0]

/**
@function cacheWorkspace

@description
The workspace is retrived from the source defined in the WORKSPACE environment variable.

Templates defined in the CUSTOM_TEMPLATES environment variable are spread into the default workspace.templates{}.

Each locale from the workspace.locale{} is merged into the workspace.locale{} template.

Locale objects get their key and name properties assigned if falsy.

The workspace is assigned to the module scope cache variable and the timestamp is recorded.

@returns {workspace} JSON Workspace.
*/
async function cacheWorkspace() {

  // Get workspace from source.
  const workspace = Object.hasOwn(getFrom, workspace_src) ?
    await getFrom[workspace_src](env.WORKSPACE) : {}

  // Return error if source failed.
  if (workspace instanceof Error) {
    return workspace
  }

  const custom_templates = env.CUSTOM_TEMPLATES
    && await getFrom[env.CUSTOM_TEMPLATES.split(':')[0]](env.CUSTOM_TEMPLATES)

  /**
  @function mark_template

  @description
  The method maps the Object.entries of the templates_object param and assigns the _type property on the object marking is a different types of templates.

  
  @param {Object} templates_object 
  @returns {Object} templates_object with _core: true property.
  */
  function mark_template(templates_object, type) {

    if (!templates_object) return;

    return Object.fromEntries(
      Object.entries(templates_object)
        .map(([key, template]) => [key, { ...template, _type: type }])
    )
  }

  // Assign default view and query templates to workspace.
  workspace.templates = {

    ...mark_template(view_templates, 'core'),
    ...mark_template(mail_templates, 'core'),
    ...mark_template(msg_templates, 'core'),
    ...mark_template(query_templates, 'core'),

    ...mark_template(custom_templates, 'custom'),

    // Default templates can be overridden by assigning a template with the same key.
    ...mark_template(workspace.templates, 'workspace')
  }

  // A workspace must have a default locale [template]
  workspace.locale ??= {
    layers: {}
  }

  // The default locale is assigned as locale in the locales object if the locales are not configured in the JSON workspace.
  workspace.locales ??= {
    locale: workspace.locale
  }

  // Loop through locale keys in workspace.
  Object.keys(workspace.locales).forEach(locale_key => {

    // workspace has a locale prototype.
    // don't merge workspace.locale with itself.
    if (workspace.locale && locale_key !== 'locale') {

      // Create clone to prevent the workspace.locale from being modified.
      const locale = structuredClone(workspace.locale)

      merge(locale, workspace.locales[locale_key])

      workspace.locales[locale_key] = locale
    }

    // Assign key value as key on locale object.
    workspace.locales[locale_key].key = locale_key

    // Assign locale key as name with no existing name on locale object.
    workspace.locales[locale_key].name ??= locale_key
  })

  if (workspace.plugins) {

    console.warn(`Default plugins should be defined in the default workspace.locale{}`)
  }

  logger(`Workspace cached;`, 'workspace')

  timestamp = Date.now()

  cache = workspace

  return workspace
}
