function mail(options) {
    if (!process.env.TRANSPORT) return console.log('Transport not set.');

    require('nodemailer').createTransport(process.env.TRANSPORT).sendMail({
        from: `\<${process.env.TRANSPORT.split(':')[1]}\>`,
        to: options.to,
        subject: options.subject,
        text: options.text
    });
}

module.exports = {
    mail: mail
};