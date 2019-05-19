const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../logger');

// Create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(
    {
        service: 'SendGrid',
        auth: {
            user: 'apikey',
            pass: config.mailer.apiKeyCode
        }
    }
);

module.exports = {
    SendMail(destEmail, title, text, css) {
        // Setup email data with unicode symbols
        let mailOptions = {
            from: "'ForUs' <" + config.mailer.mail + ">", // Sender address
            to: destEmail, // List of receivers
            subject: title, // Subject line
            html: "<div dir='rtl'>" + (css ? ReplaceStyleCss(text, css) : text) + "</div>" // html body
        };

        // Send email with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                logger.error(error);
            }
            else {
                console.log('Message sent: ' + info.response);
            }
        });
    },

    RegisterMail(email, name) {
        this.SendMail(email,
            "ForUs",
            GetTimeBlessing() + name + ", אנחנו שמחים לברך אותך על הצטרפותך לאתר ForUs!");
    },

    ForgotPasswordMail(email, name, code, resetAddress) {
        let css = {
            resetCodeStyle: '"padding:8px;background-color:#f2f2f2;border:1px solid #ccc;display:inline-block;margin-top:3px;"',
            linkStyle: '"padding:7px 16px 11px 16px;border:solid 1px #344c80;background:#547da0;border-radius:2px;color:white;text-decoration:none;"',
            lineSpaceStyle: '"margin-top:15px;"',
            btnSpaceStyle: '"margin-top:10px;"'
        }

        this.SendMail(email,
            "איפוס סיסמא",
            "<div>" + GetTimeBlessing() + name + ", " +
            "<br>" + "הקוד שהונפק עבורך לאיפוס הסיסמא הוא:</div><div style={{resetCodeStyle}}>" +
            code + "</div><br>" +
            "<div style={{lineSpaceStyle}}>או לחילופין, לחיצה על הכפתור:</div>" +
            "<div style={{btnSpaceStyle}}><a href='" + resetAddress +
            "' style={{linkStyle}}>שינוי סיסמא</a></div>",
            css);
    },

    ChangePasswordMail(email, name, resetAddress) {
        let css = {
            linkStyle: '"padding:7px 16px 11px 16px;border:solid 1px #344c80;background:#547da0;border-radius:2px;color:white;text-decoration:none;"',
            btnSpaceStyle: '"margin-top:10px;"'
        }

        this.SendMail(email,
            "שינוי סיסמא",
            "<div>" + GetTimeBlessing() + name + ", <br>" +
            "לשינוי הסיסמא - יש ללחוץ על הפתור:</div>" +
            "<div style={{btnSpaceStyle}}><a href='" +
            resetAddress + "' style={{linkStyle}}>שינוי סיסמא</a></div>",
            css);
    },

    MessageNotificationAlert(email, name, senderName) {
        let text = GetTimeBlessing() + name + ", " + "<br>" + "ממתינה עבורך הודעה חדשה<name>." + "<br>" + config.address.site;
        text = senderName ? text.replace("<name>", " מ" + senderName) : text.replace("<name>", '');

        this.SendMail(email,
            "הודעה חדשה",
            text);
    },

    FriendRequestAlert(email, name, friendName, friendId) {
        let friendProfilePageUrl = config.address.site + "/profile/" + friendId;
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
        let dateString;

        if (date) {
            dateString = "עד לתאריך: ";
            date = ConvertDateFormat(date);
        }
        else {
            dateString = "לתקופה בלתי מוגבלת";
            date = '';
        }

        this.SendMail(email,
            "חסימת משתמש",
            GetTimeBlessing() + name + ", " + "<br>" + "חשבונך באתר נחסם לשימוש.<br><br>" +
            "סיבת החסימה: " + reason + "<br>" + dateString + "<b>" + date + "</b>");
    },

    ValidateDeleteUser(email, name, deleteUserLink) {
        let css = {
            linkStyle: '"padding:7px 16px 11px 16px;border:solid 1px #344c80;background:#f44336;border-radius:2px;color:white;text-decoration:none;"',
            btnSpaceStyle: '"margin-top:10px;"'
        }

        this.SendMail(email,
            "אישור מחיקת חשבון",
            "<div>" + GetTimeBlessing() + name + ", <br>" +
            "למחיקת החשבון לצמיתות - יש ללחוץ על הפתור:</div>" +
            "<div style={{btnSpaceStyle}}><a href='" +
            deleteUserLink + "' style={{linkStyle}}>מחיקת משתמש</a></div>",
            css);
    },
};

function ConvertDateFormat(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}

function GetTimeBlessing() {
    let hour = new Date().getHours();

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

function ReplaceStyleCss(html, css) {
    Object.keys(css).forEach(className => {
        html = html.replaceAll("{{" + className + "}}", css[className]);
    });

    return html;
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};