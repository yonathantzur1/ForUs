const nodemailer = require('nodemailer');
const config = require('./config');

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.addresses.mainConnectionString);

module.exports = {
    SendMail: function (destEmail, title, text) {
        // Setup email data with unicode symbols
        var mailOptions = {
            from: "'ForUs' <" + config.addresses.mail + ">", // Sender address
            to: destEmail, // List of receivers
            subject: title, // Subject line
            html: "<div dir='rtl'>" + text + "</div>" // html body
        };

        // Send email with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    RegisterMail: function (email, name) {
        this.SendMail(email,
            "ברוך הבא!",
            "שלום " + name + ", ברוך הבא לאתר ForUs!");
    },
    ForgotPasswordMail: function (email, name, code) {
        this.SendMail(email,
            "איפוס סיסמא",
            "שלום " + name + ", " + "<br>" + "הקוד שהונפק עבורך לאיפוס הסיסמא הוא: <b>" + code + "<b>");
    },
    MessageNotificationAlert: function (email, name, senderName) {
        var text = "שלום " + name + ", " + "<br>" + "ממתינה עבורך הודעה חדשה<name>." + "<br>" + config.addresses.site;
        text = senderName ? text.replace("<name>", " מ" + senderName) : text.replace("<name>", "");

        this.SendMail(email,
            "הודעה חדשה",
            text);
    },
    FriendRequestAlert: function (email, name, friendName) {
        this.SendMail(email,
            "בקשת חברות",
            "שלום " + name + "," + "<br>" + "בקשת חברות חדשה הגיעה מ" + friendName + ".<br>" + config.addresses.site);
    },
    FriendRequestConfirm: function (email, name, friendName) {
        this.SendMail(email,
            "אישור בקשת חברות",
            "שלום " + friendName + "," + "<br>" + "החברות עם " + name + " אושרה.<br>" + config.addresses.site);
    },
    BlockMessage: function (email, name, reason, date) {
        var dateString;
        var date;

        if (date) {
            dateString = "עד לתאריך: ";
            date = ConvertDateFormat(date);
        }
        else {
            dateString = "לתקופה בלתי מוגבלת";
            date = "";
        }

        this.SendMail(email,
            "חסימת משתמש",
            "שלום " + name + ", " + "<br>" + "חשבונך באתר נחסם לשימוש.<br><br>" +
            "סיבת החסימה: " + reason + "<br>" + dateString + "<b>" + date + "</b>");
    }
};

function ConvertDateFormat(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}