const env = require('./env');

module.exports = mail => {
  if (!env.transport) return console.log('Transport not set.');

  let _mail = {
    from: `<${env.transport.split(':')[1]}>`,
    sender: `<${env.transport.split(':')[1]}>`,
    subject: mail.subject.replace(/”/g,''),
    text: mail.text.replace(/”/g,'')
  };

  if (mail.to) _mail.to = mail.to;

  if (mail.bcc) _mail.bcc = mail.bcc;

  require('nodemailer').createTransport(env.transport).sendMail(_mail);
};