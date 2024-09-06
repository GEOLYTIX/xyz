/**
## /workspace/cache
The module exports the cacheWorkspace method which returns a workspace from the module scope cache variable or call the cacheWorkspace method to cache the workspace.

Default templates can be overwritten in the workspace or by providing a CUSTOM_TEMPLATES environment variable which references a JSON with templates to be merged into the workspace.

@requires /provider/getFrom
@requires /utils/merge

@module /workspace/cache
*/

const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

process.env.WORKSPACE_AGE ??= 3600000

let cache = null

let timestamp = Infinity

const logger = require('../utils/logger')

/**
@function checkWorkspaceCache

@description
The method checks whether the module scope variable cache has been populated.

The age of the cached timestamp is checked against the WORKSPACE_AGE environment variable.

The cacheWorkspace method is called if the cache is invalid.

@returns {workspace} JSON Workspace.
*/
module.exports = function checkWorkspaceCache() {

  // cache is null on first request for workspace.
  // cacheWorkspace is async and must be awaited.
  if (!cache) return cacheWorkspace()

  // cacheWorkspace will set the current timestamp
  // and cache workspace outside export closure prior to returning workspace.  
  if ((Date.now() - timestamp) > +process.env.WORKSPACE_AGE) {

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

const workspace_src = process.env.WORKSPACE?.split(':')[0]

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

  let workspace;

  // Get workspace from source.
  workspace = Object.hasOwn(getFrom, workspace_src) ?
    await getFrom[workspace_src](process.env.WORKSPACE) : {}

  // Return error if source failed.
  if (workspace instanceof Error) {
    return workspace
  }

  const custom_templates = process.env.CUSTOM_TEMPLATES
    && await getFrom[process.env.CUSTOM_TEMPLATES.split(':')[0]](process.env.CUSTOM_TEMPLATES)

  // Assign default view and query templates to workspace.
  workspace.templates = {

    ...view_templates,
    ...mail_templates,
    ...msg_templates,
    ...query_templates,

    // Can override default templates.
    ...custom_templates,

    // Default templates can be overridden by assigning a template with the same name.
    ...workspace.templates
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
