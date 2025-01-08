/**
@module /utils/mailer
*/

const env = require('./processEnv.js')

const logger = require('./logger')

const languageTemplates = require('./languageTemplates')

const getFrom = require('../provider/getFrom')

const mailer = require('nodemailer')

let transport

module.exports = async params => {

  if (env.TRANSPORT) {

    console.warn('Please replace env.TRANSPORT with TRANSPORT_HOST,TRANSPORT_EMAIL, and TRANSPORT_PASSWORD')
  }

   
  if (!env.TRANSPORT_HOST) {
    console.warn('env.TRANSPORT_HOST missing.')
    return;
  }

  if (!env.TRANSPORT_EMAIL) {
    console.warn('env.TRANSPORT_EMAIL missing.')
    return;
  }

  if (!env.TRANSPORT_PASSWORD) {
    console.warn('env.TRANSPORT_PASSWORD missing.')
    return;
  }

  if (!transport) {

    transport = mailer.createTransport({
        host: env.TRANSPORT_HOST,
        name: env.TRANSPORT_EMAIL.split('@')[0],
        port: env.TRANSPORT_PORT || 587,
        secure: false,
        requireTLS: env.TRANSPORT_TLS && true,
        auth: {
          user: env.TRANSPORT_EMAIL,
          pass: env.TRANSPORT_PASSWORD
        }
      })
  }

  const template = await languageTemplates(params)

  await getBody(template)

  const mailTemplate = {
    to: params.to,
    from: env.TRANSPORT_EMAIL,
    sender: env.TRANSPORT_EMAIL,
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