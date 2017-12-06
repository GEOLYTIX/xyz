const transporter = require('nodemailer').createTransport(process.env.TRANSPORT);

function mail(options) {
    transporter.sendMail({
        from: process.env.SUBDIRECTORY + '\@' + process.env.HOST + '\ \<geolytix@gmail.com\>',
        to: options.to,
        subject: options.subject,
        text: options.text
    }, function (err, info) {
        if (err) {
            return console.log('mod.mailer: ' + err);
        }
        console.log('mod.mailer: ' + info.response);
    });
}

module.exports = {
    mail: mail
};
