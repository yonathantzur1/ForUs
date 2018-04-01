const nodemailer = require('nodemailer');
const config = require('./config');

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.addresses.mainConnectionString);

module.exports = {
    SendMail: function (destEmail, contentObj) {
        // Setup email data with unicode symbols
        var mailOptions = {
            from: "'ForUs' <" + config.addresses.mail + ">", // Sender address
            to: destEmail, // List of receivers
            subject: contentObj.title, // Subject line
            html: "<div dir='rtl'>" + contentObj.text + "</div>" // html body
        };

        // Send email with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    },
    GetRegisterMailContent: function (name) {
        var content = {
            title: "ברוך הבא!",
            text: "שלום " + name + ", ברוך הבא לאתר ForUs!"
        };

        return content;
    },
    GetForgotMailContent: function (name, code) {
        var content = {
            title: "איפוס סיסמא",
            text: "שלום " + name + ", " + "<br>" + "הקוד שהונפק עבורך לאיפוס הסיסמא הוא: <b>" + code + "<b>"
        };

        return content;
    },
    GetMessageNotificationAlertContent: function (name, senderName) {
        var content = {
            title: "הודעה חדשה",
            text: "שלום " + name + ", " + "<br>" + "ממתינה עבורך הודעה חדשה*." + "<br>" + config.addresses.site
        };

        content.text = senderName ? content.text.replace("*", " מ" + senderName) : content.text.replace("*", "");

        return content;
    },
    GetFriendRequestAlertContent: function (name, friendName) {
        var content = {
            title: "בקשת חברות",
            text: "שלום " + name + "," + "<br>" + "בקשת חברות חדשה הגיעה מ" + friendName + " :)<br>" + config.addresses.site
        };

        return content;
    },
    GetFriendRequestConfirmContent: function (name, friendName) {
        var content = {
            title: "אישור בקשת חברות",
            text: "שלום " + friendName + "," + "<br>" + "החברות עם " + name + " אושרה.<br>" + config.addresses.site
        };

        return content;
    },
    GetBlockMessageContent: function (name, reason, date) {
        date = date ? "עד לתאריך " + ConvertDateFormat(date) : "לתקופה בלתי מוגבלת";

        var content = {
            title: "חסימת משתמש",
            text: "שלום " + name + ", " + "<br>" + "חשבונך נחסם לשימוש.<br>" +
                "סיבת החסימה: " + reason + "<br><b>" + date + "</b><br>"
        };

        return content;
    }
};

function ConvertDateFormat(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}