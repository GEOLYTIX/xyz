/**

The view module retrieves a view template, and substitutes parameter before sending the view to the client. 

@module view
*/

const logger = require('./utils/logger')

const languageTemplates = require('./utils/languageTemplates')

module.exports = async (req, res) => {

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

    // Encode stringified user for template.
    params.user ??= encodeURI(JSON.stringify({
      email: req.params.user.email,
      admin: req.params.user.admin,
      roles: req.params.user.roles,
      language: req.params.user.language
    }));
  }

  const template = await languageTemplates(params)

  if (!template) {
    res.status(400).send(`Template undefined`)
    return;
  }

  const view = template.replace(/{{2}([A-Za-z][A-Za-z0-9]*)}{2}/g, matched => {

    // regex matches {{ or }}
    return params[matched.replace(/(^{{)|(}}$)/g, '')] || ''
  });

  res.send(view);
}