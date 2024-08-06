/**
@module /workspace/getLocale
*/

const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getTemplate = require('./template')

module.exports = async (params) => {

  const workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return workspace
  }

  if (!Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  let locale = workspace.locales[params.locale]

  const localeTemplate = await getTemplate(params.locale)

  if (localeTemplate) {

    if (localeTemplate instanceof Error) {

      return localeTemplate
    } else {

      locale = merge(localeTemplate, locale)
    }
  }

  if (!Roles.check(locale, params.user?.roles)) {
    return new Error('Role access denied.')
  }

  return locale
}