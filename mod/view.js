const templates = require('./templates/_templates');

const Roles = require('./utils/roles.js')

const login = require('./user/login')

module.exports = async (req, res) => {

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

  const user = req.params.user && encodeURI(JSON.stringify({
    email: req.params.user.email,
    admin: req.params.user.admin,
    roles: req.params.user.roles,
    language: req.params.user.language
  }));

  const params = Object.assign(
    req.params || {},
    {
      title: process.env.TITLE,
      dir: process.env.DIR,
      user: user,
      language: req.params.language,
      locale: req.params.locale,
      login: (process.env.PRIVATE || process.env.PUBLIC) && 'true',
    },
    // regex matches SRC_ at the start of string
    Object.fromEntries(Object.entries(process.env).filter(entry => entry[0].match(/^SRC_/)))
  );

  // Template is provided from workspace
  if (req.params.template?.template) {

    // regex captures characters inside {{ }}
    return res.send(req.params.template?.template.replace(/[{]{2}([A-Za-z][A-Za-z0-9]*)[}]{2}/g, matched => {

      // regex matches {{ or }}
      return params[matched.replace(/[{]{2}|[}]{2}/g, '')] || '';
    }));
  }

  // Get view template.
  const view = await templates(
    'default_view',
    req.params.language || req.params.user?.language,
    params
  );

  res.send(view);
}