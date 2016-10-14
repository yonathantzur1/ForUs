var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://forusmailer%40gmail.com:popCorn1@smtp.gmail.com');

module.exports = {
    SendMail: function(p_destMail, p_mailContent) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"ForUs" <forusmailer@gmail.com>', // sender address
            to: p_destMail, // list of receivers
            subject: p_mailContent.title, // Subject line
            text: p_mailContent.text // plaintext body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    GetRegisterMailContent: function(p_name) {
        var content = {
            title: "ברוך הבא!",
            text: "שלום " + p_name + ", ברוך הבא לאתר ForUs!"
        };

        return content;
    }
};