const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

process.env.WORKSPACE_AGE ??= 3600000

let cache = null

let timestamp = Infinity

const logger = require('../utils/logger')

module.exports = () => {

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

const view_templates = require('./templates/views')

const mail_templates = require('./templates/mails')

const msg_templates = require('./templates/msgs')

const query_templates = require('./templates/queries')

async function cacheWorkspace() {

  // Get workspace from source.
  const workspace = process.env.WORKSPACE ?
    await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) : {}

  // Return error if source failed.
  if (workspace instanceof Error) {
    return {};
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

  workspace.locale ??= {
    layers: {}
  }

  workspace.locales ??= {
    locale: workspace.locale
  }

  // Loop through locale keys in workspace.
  Object.keys(workspace.locales).forEach(locale_key => {

    // Get locale object from key.
    const locale = workspace.locales[locale_key]

    // Merge the workspace template into workspace.
    merge(locale, workspace.locale)

    // Assign key value as key on locale object.
    locale.key = locale_key

    // Assign locale key as name with no existing name on locale object.
    locale.name ??= locale_key
  })

  if (workspace.plugins) {

    console.warn(`Default plugins should be defined in the default workspace.locale{}`)
  }

  logger(`Workspace cached;`, 'workspace')

  timestamp = Date.now()

  cache = workspace

  return workspace
}