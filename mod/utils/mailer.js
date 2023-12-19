const logger = require('./logger')

const languageTemplates = require('./languageTemplates')

const getFrom = require('../provider/getFrom')

const mailer = require('nodemailer')

let transport

module.exports = async params => {

  if (!process.env.TRANSPORT && !process.env.TRANSPORT_HOST) {
    console.warn('No transport method set for mail.')
    return;
  }

  const user = process.env.TRANSPORT_EMAIL || process.env.TRANSPORT.split(':')[1]

  const pass = process.env.TRANSPORT_PASSWORD || process.env.TRANSPORT.split(':')[2].split('@')[0]

  const host = process.env.TRANSPORT_HOST || process.env.TRANSPORT.split(':')[2].split('@')[1]

  if (!transport) {

    transport = mailer.createTransport({
        host: host,
        name: user.split('@')[0],
        port: process.env.TRANSPORT_PORT || 587,
        secure: false,
        requireTLS: process.env.TRANSPORT_TLS && true,
        auth: {
          user: user,
          pass: pass
        }
      })
  }

  const template = await languageTemplates(params)

  await getBody(template)

  const mailTemplate = {
    to: params.to,
    from: user,
    sender: user,
    subject: replaceStringParams(template.subject, params),
    html: template.html ? replaceStringParams(template.html, params) : undefined,
    text: template.text ? replaceStringParams(template.text, params) : undefined
  }
 
  const result = await transport.sendMail(mailTemplate).catch(err => console.error(err))

  logger(result, 'mailer')
}

async function getBody(template){

  if (template.text) {

    // Prevent mail template from having text and html
    delete template.html

    if (Object.hasOwn(getFrom, template.text.split(':')[0])) {

      template.text = await getFrom[template.text.split(':')[0]](template.text)
    }
  }

  if (template.html) {

    if (Object.hasOwn(getFrom, template.html.split(':')[0])) {

      template.html =  await getFrom[template.html.split(':')[0]](template.html)
    }
  }
}

function replaceStringParams(string, params) {

  return string.replace(/\$\{(.*?)\}/g,

    // Replace matched params in string values
    matched => params[matched.replace(/\$\{|\}/g, '')] || '')
}