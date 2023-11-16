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

  const email = process.env.TRANSPORT_EMAIL || process.env.TRANSPORT.split(':')[1]

  if (!transport) {

    transport = mailer.createTransport({
        host: process.env.TRANSPORT_HOST,
        name: email.match(/[^@]*$/)[0],
        port: process.env.TRANSPORT_PORT || 587,
        secure: false,
        requireTLS: process.env.TRANSPORT_TLS && true,
        auth: {
          user: email,
          pass: process.env.TRANSPORT_PASSWORD
        }
      })
  }

  const template = await languageTemplates(params)

  if (template.text) {

    // Prevent mail template from having text and html
    delete template.html

    if (Object.hasOwn(getFrom, template.text.split(':')[0])) {

      template.text =  await getFrom[template.text.split(':')[0]](template.text)

      if (!template.text) return;
    }

    template.text = replaceStringParams(template.text, params)
  }

  if (template.html) {

    if (Object.hasOwn(getFrom, template.html.split(':')[0])) {

      template.html =  await getFrom[template.html.split(':')[0]](template.html)

      if (!template.html) return;
    }

    template.html = replaceStringParams(template.html, params)
  }

  template.subject = replaceStringParams(template.subject, params)

  template.to = params.to
  template.from = email
  template.sender = email
  
  const result = await transport.sendMail(template).catch(err => console.error(err))

  logger(result, 'mailer')
}

function replaceStringParams(string, params) {

  return string.replace(/\$\{(.*?)\}/g,

    // Replace matched params in string values
    matched => params[matched.replace(/\$\{|\}/g, '')] || '')
}