const { readFileSync } = require('fs')

const { join } = require('path')

module.exports = async (req, res) => {

  const template = readFileSync(join(__dirname, '../../public/views/_user.html')).toString('utf8')

  const params = {
    dir: process.env.DIR
  }

  // Render the login template with params.
  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  res.send(html)

}