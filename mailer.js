module.exports = mail => {
    if (!process.env.TRANSPORT) return console.log('Transport not set.');

    let _mail = {
        from: `\<${process.env.TRANSPORT.split(':')[1]}\>`,
        subject: mail.subject.replace(/”/g,""),
        text: mail.text.replace(/”/g,"")
    };

    if (mail.to) _mail.to = mail.to;

    if (mail.bcc) _mail.bcc = mail.bcc;

    require('nodemailer').createTransport(process.env.TRANSPORT).sendMail(_mail);
}