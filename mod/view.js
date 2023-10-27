const Roles = require('./utils/roles.js')

const login = require('./user/login')

const logger = require('./utils/logger')

const languageTemplates = require('./utils/languageTemplates')

const workspaceCache = require('./workspace/cache')

module.exports = async (req, res) => {

  const workspace = await workspaceCache()

  logger(req.url, 'view-req-url')

  const params = {}

  Object.keys(req.params)
    .filter(key => typeof req.params[key] === 'string')
    .forEach(key => params[key] = req.params[key])

  params.template ??= 'default_view'

  params.dir ??= process.env.DIR

  params.login ??= (process.env.PRIVATE || process.env.PUBLIC) && 'true'

  params.title ??= process.env.TITLE

  params.msg = req.params.msg && await languageTemplates({
    template: req.params.msg,
    language: req.params.language
  })

  if (req.params.user && typeof req.params.user === 'object') {

    params.language ??= req.params.user.language

    const roles = req.params.user?.roles || []

    const locales = Object.values(workspace.locales)
      .filter(locale => !!Roles.check(locale, roles))
      .map(locale => ({
        key: locale.key,
        name: locale.name
      }))
  
    if (!locales.length) {

      req.params.msg = 'no_locales'
      return login(req, res)
    }

    // Encode stringified user for template.
    params.user ??= encodeURI(JSON.stringify({
      email: req.params.user.email,
      admin: req.params.user.admin,
      roles: req.params.user.roles,
      language: req.params.user.language
    }));
  }

  // Object.entries(process.env)
  //   .filter(entry => entry[0].match(/^SRC_/))
  //   .forEach(entry => params[entry[0].replace(/^SRC_/, '')]=entry[1])

  const template = await languageTemplates(params)

  const view = template.replace(/{{2}([A-Za-z][A-Za-z0-9]*)}{2}/g, matched => {

    // regex matches {{ or }}
    return params[matched.replace(/(^{{)|(}}$)/g, '')] || ''
  });

  res.send(view);
}