const getFrom = require('../provider/getFrom')

const merge = require('../utils/merge')

process.env.WORKSPACE_AGE ??= 3600000

let workspace = null

const logger = require('../utils/logger')

module.exports = async () => {

  const timestamp = Date.now()

  // Cache workspace if empty.
  if (!workspace) {
    await cache()
    logger(`Workspace empty; Time to cache: ${Date.now() - timestamp}`, 'workspace')
  }

  // Logically assign timestamp.
  workspace.timestamp ??= timestamp

  // Cache workspace if expired.
  if ((timestamp - workspace.timestamp) > +process.env.WORKSPACE_AGE) {

    await cache()
    logger(`Workspace cache expired; Time to cache: ${Date.now() - timestamp}`, 'workspace')
    workspace.timestamp = timestamp
  }

  return workspace
}

const view_templates = require('./templates/views')

const mail_templates = require('./templates/mails')

const msg_templates = require('./templates/msgs')

const query_templates = require('./templates/queries')

async function cache() {

  // Get workspace from source.
  workspace = process.env.WORKSPACE ?
    await getFrom[process.env.WORKSPACE.split(':')[0]](process.env.WORKSPACE) : {}

  // Return error if source failed.
  if (workspace instanceof Error) return workspace

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

    // A default locale has been defined in the workspace.
    if (typeof workspace.locale === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.locale)
    }

    // A template exists for the locale key.
    if (Object.hasOwn(workspace.templates, locale_key) && typeof workspace.templates[locale_key] === 'object') {

      // Merge the workspace template into workspace.
      merge(locale, workspace.templates[locale_key])
    }

    // Assign key value as key on locale object.
    locale.key = locale_key

    // Assign locale key as name with no existing name on locale object.
    locale.name = locale.name || locale_key
  })

  if (workspace.plugins) {

    console.warn(`Default plugins should be defined in the default workspace.locale{}`)
  }

  // Substitute all SRC_* variables in locales.
  workspace.locales = JSON.parse(
    JSON.stringify(workspace.locales).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/\$|\{|\}/g, '')}`] || matched)
  )

}