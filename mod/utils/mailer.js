/**
@module /utils/mailer
*/

const logger = require('./logger')

const languageTemplates = require('./languageTemplates')

const getFrom = require('../provider/getFrom')

const mailer = require('nodemailer')

let transport

module.exports = async params => {

  if (process.env.TRANSPORT) {

    console.warn('Please replace process.env.TRANSPORT with TRANSPORT_HOST,TRANSPORT_EMAIL, and TRANSPORT_PASSWORD')
  }

  if (!process.env.TRANSPORT_HOST) {
    console.warn('process.env.TRANSPORT_HOST missing.')
    return;
  }

  if (!process.env.TRANSPORT_EMAIL) {
    console.warn('process.env.TRANSPORT_EMAIL missing.')
    return;
  }

  if (!process.env.TRANSPORT_PASSWORD) {
    console.warn('process.env.TRANSPORT_PASSWORD missing.')
    return;
  }

  if (!transport) {

    transport = mailer.createTransport({
        host: process.env.TRANSPORT_HOST,
        name: process.env.TRANSPORT_EMAIL.split('@')[0],
        port: process.env.TRANSPORT_PORT || 587,
        secure: false,
        requireTLS: process.env.TRANSPORT_TLS && true,
        auth: {
          user: process.env.TRANSPORT_USERNAME || process.env.TRANSPORT_EMAIL,
          pass: process.env.TRANSPORT_PASSWORD
        }
      })
  }

  const template = await languageTemplates(params)

  await getBody(template)

  const mailTemplate = {
    to: params.to,
    from: process.env.TRANSPORT_EMAIL,
    sender: process.env.TRANSPORT_EMAIL,
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
