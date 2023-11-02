const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getTemplate = require('./getTemplate')

module.exports = async (params) => {

  const workspace = await workspaceCache()

  if (!Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  const locale = workspace.locales[params.locale]

  const roles = params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return new Error('Role access denied.')
  }

  // A template exists for the locale key.
  if (Object.hasOwn(workspace.templates, params.locale)) {

    // Merge the workspace template into workspace.
    merge(locale, await getTemplate(workspace.templates[params.locale]))
  }

  return locale
}