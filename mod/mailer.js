const logger = require('./logger')

const mailer = require('nodemailer')

module.exports = async mail => {

  if (!process.env.TRANSPORT && !process.env.TRANSPORT_HOST) return console.error(new Error('Transport not set.'))

  const email = process.env.TRANSPORT_EMAIL || process.env.TRANSPORT.split(':')[1]

  Object.assign(mail, {
    from: email,
    sender: email,
  })

  mail.text = mail.text.replace(/^(?!\s+$)\s+/gm, '')

  if (!process.env.TRANSPORT_HOST) return mailer.createTransport(process.env.TRANSPORT).sendMail(mail)

  const transporter = mailer.createTransport(  {
    host: process.env.TRANSPORT_HOST,
    name: email.match(/[^@]*$/)[0],
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: email,
      pass: process.env.TRANSPORT_PASSWORD
    }
  })

  const result = await transporter.sendMail(mail).catch(err => console.error(err))

  logger(result, 'mailer')

}