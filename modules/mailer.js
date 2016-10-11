var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://forusmailer%40gmail.com:popCorn1@smtp.gmail.com');

module.exports = {
    SendMail: function(p_destMail, p_title, p_text) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"ForUs" <forusmailer@gmail.com>', // sender address
            to: p_destMail, // list of receivers
            subject: p_title, // Subject line
            text: p_text // plaintext body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    RegisterMail: {
        title: "ברוך הבא!",
        text: "שלום, ברוך הבא לאתר ForUs!"
    }
};