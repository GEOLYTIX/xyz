const Roles = require('./utils/roles.js')

const login = require('./user/login')

const logger = require('./utils/logger')

const languageTemplates = require('./utils/languageTemplates')

module.exports = async (req, res) => {

  logger(req.url, 'view-req-url')

  const roles = req.params.user?.roles || []

  const locales = Object.values(req.params.workspace.locales)
    .filter(locale => !!Roles.check(locale, roles))
    .map(locale => ({
      key: locale.key,
      name: locale.name
    }))

  if (!locales.length) {

    return login(req, res, 'no_locales')
  }

  // Encode stringified user for template.
  const user = req.params.user && encodeURI(JSON.stringify({
    email: req.params.user.email,
    admin: req.params.user.admin,
    roles: req.params.user.roles,
    language: req.params.user.language
  }));

  const params = {
    //...req.params,
    language: req.params.user?.language || 'en',
    title: process.env.TITLE,
    dir: process.env.DIR,
    user: user,
    login: (process.env.PRIVATE || process.env.PUBLIC) && 'true',
  }

  // Object.entries(process.env)
  //   .filter(entry => entry[0].match(/^SRC_/))
  //   .forEach(entry => params[entry[0].replace(/^SRC_/, '')]=entry[1])

  params.template ??= 'default_view'

  // // Template is provided from workspace
  // if (req.params.template?.template) {

  //   // regex captures characters inside {{ }}
  //   return res.send(req.params.template?.template.replace(/[{]{2}([A-Za-z][A-Za-z0-9]*)[}]{2}/g, matched => {

  //     // regex matches {{ or }}
  //     return params[matched.replace(/[{]{2}|[}]{2}/g, '')] || '';
  //   }));
  // }

  // Get view template.
  // const view = await templates(
  //   'default_view',
  //   req.params.language || req.params.user?.language,
  //   params
  // );

  const view = await languageTemplates(req, params)

  res.send(view);
}