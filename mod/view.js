const templates = require('./templates/_templates')

module.exports = async (req, res) => {

  const user = req.params.user && encodeURI(JSON.stringify({
    email: req.params.user.email,
    admin: req.params.user.admin,
    roles: req.params.user.roles
  }))

  const params = Object.assign(
    req.params || {},
    {
      title: process.env.TITLE,
      dir: process.env.DIR,
      user: user,
      language: req.params.language,
      login: (process.env.PRIVATE || process.env.PUBLIC) && 'true',
    },
    Object.fromEntries(Object.entries(process.env).filter(entry => entry[0].match(/^SRC_/))))

  // Template is provided from workspace
  if (req.params.template?.template) {

    return res.send(req.params.template?.template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || ''))
  }

  let template = await templates(
    'default_view',
    req.params.language || req.params.user?.language,
    params)

  res.send(template.html)
}