const mailer = require('nodemailer')

module.exports = async mail => {

  if (!process.env.TRANSPORT) return console.error(new Error('Transport not set.'))

  Object.assign(mail, {
    from: `<${process.env.TRANSPORT.split(':')[1]}>`,
    sender: `<${process.env.TRANSPORT.split(':')[1]}>`,
  })

  mail.text = mail.text.replace(/^(?!\s+$)\s+/gm, '')
  return mailer.createTransport(process.env.TRANSPORT).sendMail(mail)
};