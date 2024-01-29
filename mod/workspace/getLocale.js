const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getTemplate = require('./getTemplate')

module.exports = async (params) => {

  const workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return workspace
  }

  if (!Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  let locale = workspace.locales[params.locale]

  if (!Roles.check(locale, params.user?.roles)) {
    return new Error('Role access denied.')
  }

  // A template exists for the locale key.
  if (Object.hasOwn(workspace.templates, params.locale)) {

    let template = structuredClone(await getTemplate(workspace.templates[params.locale]))

    // Merge the workspace template into workspace.
    locale = merge(template, locale)
  }

  return locale
}