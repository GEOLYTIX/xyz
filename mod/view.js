module.exports = async (req, res) => {

  if (!req.params.template) return res.status(400).send('No template provided for request.')

  const user = req.params.user && encodeURI(JSON.stringify({
    email: req.params.user.email,
    admin: req.params.user.admin,
    roles: req.params.user.roles
  }))


  function render(template, params) {

    return template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  }

  const html = render(
    req.params.template.template,
    Object.assign(
      req.params || {}, {
        title: process.env.TITLE,
        dir: process.env.DIR,
        user: user,
        language: req.params.language,
        login: (process.env.PRIVATE || process.env.PUBLIC) && 'true',
      },
      Object.fromEntries(Object.entries(process.env).filter(entry => entry[0].match(/^SRC_/))))
  )

  res.send(html)
}