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

    transport = process.env.TRANSPORT ?
      mailer.createTransport(process.env.TRANSPORT) :
      mailer.createTransport({
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

    if (Object.hasOwn(getFrom, template.text?.split(':')[0])) {

      template.text =  await getFrom[template.text.split(':')[0]](template.text)
    }

    template.text = replaceStringParams(template.text, params)

    template.text = template.text.replace(/^(?!\s+$)\s+/gm, '')
  }

  if (Object.hasOwn(getFrom, template.html?.split(':')[0])) {

    template.html = await getFrom[template.html.split(':')[0]](template.html)

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

  return string.replace(/\$\{{1}(.*?)\}{1}/g,

    // Replace matched params in string values
    matched => params[matched.replace(/\$\{{1}|\}{1}/g, '')] || '')
}