module.exports = mail => {
    if (!process.env.TRANSPORT) return console.log('Transport not set.');

    require('nodemailer').createTransport(process.env.TRANSPORT).sendMail({
        from: `\<${process.env.TRANSPORT.split(':')[1]}\>`,
        to: mail.to,
        subject: mail.subject,
        text: mail.text
    });
}