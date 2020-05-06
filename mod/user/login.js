const acl = require('../auth/acl')()

const { readFileSync } = require('fs')

const { join } = require('path')

const template = readFileSync(join(__dirname, '../../public/views/_login.html')).toString('utf8')

const render = params => template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  const rows = await acl(`select * from acl_schema.acl_table limit 1`)

  if (rows instanceof Error) return res.send('Failed to connect with Access Control List.')

  const html = render({
    dir: process.env.DIR || '',
    redirect: req.url && decodeURIComponent(req.url),
    msg: msg || ' ',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  })

  res.send(html)
}