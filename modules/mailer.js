const nodemailer = require('nodemailer');
const config = require('./config');

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.addresses.mainConnectionString);

module.exports = {
    SendMail: function (p_destMail, p_mailContent) {
        // Setup email data with unicode symbols
        var mailOptions = {
            from: "'ForUs' <" + config.addresses.mail + ">", // Sender address
            to: p_destMail, // List of receivers
            subject: p_mailContent.title, // Subject line
            html: "<div dir='rtl'>" + p_mailContent.text + "</div>" // html body
        };

        // Send email with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    GetRegisterMailContent: function (p_name) {
        var content = {
            title: "ברוך הבא!",
            text: "שלום " + p_name + ", ברוך הבא לאתר ForUs!"
        };

        return content;
    },
    GetForgotMailContent: function (p_name, p_code) {
        var content = {
            title: "איפוס סיסמא",
            text: "שלום " + p_name + ", הקוד שהונפק עבורך לאיפוס הסיסמא הוא: " + p_code
        };

        return content;
    },
    GetMessageNotificationAlertContent: function (p_name) {
        var content = {
            title: "הודעה חדשה",
            text: "שלום " + p_name + ", ממתינה עבורך הודעה חדשה!" + "<br>" + config.addresses.site
        };

        return content;
    },
};