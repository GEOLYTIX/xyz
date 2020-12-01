module.exports = async (req, res) => {

  const user = req.params.user && encodeURI(JSON.stringify({
    email: req.params.user.email,
    admin: req.params.user.admin
  }))

  const html = req.params.template.render(Object.assign(
    req.params || {},
    {
      title: process.env.TITLE,
      dir: process.env.DIR,
      user: user,
      language: req.params.language,
      login: (process.env.PRIVATE || process.env.PUBLIC) && 'true',
    },
    Object.fromEntries(Object.entries(process.env).filter(entry => entry[0].match(/^SRC_/)))))

  //Build the template with jsrender and send to client.
  res.send(html)

}