/**
## Workspace API
The getLocale module exports the getLocale method which is required by the getLayer and workspace modules.

@requires /utils/roles
@requires /utils/merge
@requires /workspace/cache
@requires /workspace/getTemplate

@module /workspace/getLocale
*/

const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getTemplate = require('./getTemplate')

/**
@function getLocale
@async

@description
The getLocale method requests the workspace from cache and checks whether the requested locale is a property of the workspace.locales{}.

The workspace.locale is assigned as locale if params.locale is undefined.

The locale will be merged into template matching the params.locale key.

A role check is performed to check whether the requesting user has access to the locale.

Role objects in the locale and nested layers are merged with their respective parent objects.

${*} template parameter are substituted with values from SRC_* environment variables.

@param {Object} params 
@property {string} [params.locale] Locale key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Locale.
*/
module.exports = async function getLocale(params) {

  const workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return workspace
  }

  if (params.locale && !Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  // The workspace.locale is assigned as locale if params.locale is undefined.
  let locale = !params.locale
    ? workspace.locale
    : workspace.locales[params.locale]

  const localeTemplate = params.locale && await getTemplate(params.locale.replace(/[^a-zA-Z0-9_]/g, ''))

  if (localeTemplate && !(localeTemplate instanceof Error)) {

    locale = merge(localeTemplate, locale)
  }

  if (!Roles.check(locale, params.user?.roles)) {
    return new Error('Role access denied.')
  }

  locale = Roles.objMerge(locale, params.user?.roles)

  // Subtitutes ${*} with process.env.SRC_* key values.
  locale = JSON.parse(
    JSON.stringify(locale).replace(/\$\{(.*?)\}/g,
      matched => process.env[`SRC_${matched.replace(/(^\${)|(}$)/g, '')}`])
  )

  return locale
}
