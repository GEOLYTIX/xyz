function mail(options) {
    require('nodemailer').createTransport(process.env.TRANSPORT).sendMail({
        //from: process.env.SUBDIRECTORY + '\@' + process.env.HOST + '\ \<geolytix@gmail.com\>',
        from: '\<geolytix@gmail.com\>',
        to: options.to,
        subject: options.subject,
        text: options.text
    });
}

module.exports = {
    mail: mail
};