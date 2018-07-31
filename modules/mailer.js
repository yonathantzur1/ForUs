const nodemailer = require('nodemailer');
const config = require('../config');

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(config.addresses.mailConnectionString);

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
            "ForUs",
            GetTimeBlessing() + name + ", אנחנו שמחים לברך אותך על הצטרפותך לאתר ForUs!");
    },
    ForgotPasswordMail: function (email, name, code, resetAddress) {
        this.SendMail(email,
            "איפוס סיסמא",
            GetTimeBlessing() + name +
            ", " + "<br>" + "הקוד שהונפק עבורך לאיפוס הסיסמא הוא: <b>" + code + "</b><br><br>" +
            "או לחילופין, כניסה לקישור:<br>" + resetAddress);
    },
    MessageNotificationAlert: function (email, name, senderName) {
        var text = GetTimeBlessing() + name + ", " + "<br>" + "ממתינה עבורך הודעה חדשה<name>." + "<br>" + config.addresses.site;
        text = senderName ? text.replace("<name>", " מ" + senderName) : text.replace("<name>", "");

        this.SendMail(email,
            "הודעה חדשה",
            text);
    },
    FriendRequestAlert: function (email, name, friendName) {
        this.SendMail(email,
            "בקשת חברות",
            GetTimeBlessing() + name + "," + "<br>" + "בקשת חברות חדשה הגיעה מ" + friendName + ".<br>" + config.addresses.site);
    },
    FriendRequestConfirm: function (email, name, friendName) {
        this.SendMail(email,
            "אישור בקשת חברות",
            GetTimeBlessing() + friendName + "," + "<br>" + "החברות עם " + name + " אושרה.<br>" + config.addresses.site);
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
            GetTimeBlessing() + name + ", " + "<br>" + "חשבונך באתר נחסם לשימוש.<br><br>" +
            "סיבת החסימה: " + reason + "<br>" + dateString + "<b>" + date + "</b>");
    }
};

function ConvertDateFormat(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}

function GetTimeBlessing() {
    var hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "בוקר טוב ";
    }
    else if (hour >= 12 && hour < 14) {
        return "צהריים טובים ";
    }
    else if (hour >= 14 && hour < 17) {
        return "אחר הצהריים טובים ";
    }
    else if (hour >= 17 && hour < 21) {
        return "ערב טוב ";
    }
    else {
        return "לילה טוב ";
    }
}