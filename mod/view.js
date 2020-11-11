const auth = require('./user/auth')

module.exports = async (req, res) => {

  const template = req.params.workspace.templates[req.params._template || req.params.template || 'mapp']

  if (!template) return res.status(404).send('View template not found.')

  if (template.err) return res.status(500).send(template.err.message)

  const access = template.access || req.params.access
   
  if (access) {

    await auth(req, res, access)

    if (res.finished) return
  }

  const html = template.render(Object.assign(
    req.params || {},
    {
      title: process.env.TITLE,
      dir: process.env.DIR,
      token: req.params.token && req.params.token.signed || '""',
      login: (process.env.PRIVATE || process.env.PUBLIC) && 'true' || '""',
    },
    Object.fromEntries(Object.entries(process.env).filter(entry => entry[0].match(/^SRC_/)))))

  //Build the template with jsrender and send to client.
  res.send(html)

}