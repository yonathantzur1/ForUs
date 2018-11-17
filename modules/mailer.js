const nodemailer = require('nodemailer');
const config = require('../config');

// Create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(
    {
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: config.mailer.apiKeyCode
        }
    }
);

module.exports = {
    SendMail(destEmail, title, text) {
        // Setup email data with unicode symbols
        var mailOptions = {
            from: "'ForUs' <" + config.mailer.mail + ">", // Sender address
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

    RegisterMail(email, name) {
        this.SendMail(email,
            "ForUs",
            GetTimeBlessing() + name + ", אנחנו שמחים לברך אותך על הצטרפותך לאתר ForUs!");
    },

    ForgotPasswordMail(email, name, code, resetAddress) {
        var codeStyle = '"padding:10px;background-color:#f2f2f2;border:1px solid #ccc;line-height:40px"';
        var linkStyle = '"padding:7px 16px 11px 16px;border:solid 1px #344c80;' +
            'background:#547da0;border-radius:2px;color:white;text-decoration:none;line-height:40px;"';
        this.SendMail(email,
            "איפוס סיסמא",
            GetTimeBlessing() + name + ", " +
            "<br>" + "הקוד שהונפק עבורך לאיפוס הסיסמא הוא:<br><span style=" + codeStyle + ">" +
            code + "</span><br><br>" +
            "או לחילופין, לחיצה על הכפתור:<br>" +
            "<a href='" + resetAddress + "' style=" + linkStyle + ">שינוי סיסמא</a>");
    },

    ChangePasswordMail(email, name, resetAddress) {
        var linkStyle = '"padding:7px 16px 11px 16px;border:solid 1px #344c80;' +
            'background:#547da0;border-radius:2px;color:white;text-decoration:none;line-height:40px;"';
        this.SendMail(email,
            "שינוי סיסמא",
            GetTimeBlessing() + name +
            ", " + "<br>" + "לשינוי הסיסמא - יש ללחוץ על הפתור:<br>" +
            "<a href='" + resetAddress + "' style=" + linkStyle + ">שינוי סיסמא</a>");
    },

    MessageNotificationAlert(email, name, senderName) {
        var text = GetTimeBlessing() + name + ", " + "<br>" + "ממתינה עבורך הודעה חדשה<name>." + "<br>" + config.address.site;
        text = senderName ? text.replace("<name>", " מ" + senderName) : text.replace("<name>", "");

        this.SendMail(email,
            "הודעה חדשה",
            text);
    },

    FriendRequestAlert(email, name, friendName, friendId) {
        var friendProfilePageUrl = config.address.site + "/profile/" + friendId;
        this.SendMail(email,
            "בקשת חברות",
            GetTimeBlessing() + name + "," + "<br>" + "בקשת חברות חדשה הגיעה מ" + friendName + ".<br>" + friendProfilePageUrl);
    },

    FriendRequestConfirm(email, name, friendName) {
        this.SendMail(email,
            "אישור בקשת חברות",
            GetTimeBlessing() + friendName + "," + "<br>" + "החברות עם " + name + " אושרה.<br>" + config.address.site);
    },

    BlockMessage(email, name, reason, date) {
        var dateString;

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