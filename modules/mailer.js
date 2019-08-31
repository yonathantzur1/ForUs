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
        transporter.sendMail(mailOptions, (error) => {
            error && logger.error(error);
        });
    },

    RegisterMail(email, name) {
        this.SendMail(email,
            "ForUs",
            GetTimeBlessing(name) +
            "אנחנו שמחים לברך אותך על הצטרפותך לאתר ForUs!");
    },

    ForgotPasswordMail(email, name, code, resetAddress) {
        let css = {
            resetCodeStyle: "padding:8px;background-color:#f2f2f2;border:1px solid #ccc;display:inline-block;margin-top:3px;",
            linkStyle: "padding:7px 16px;border:solid 1px #344c80;background:#547da0;border-radius:2px;color:white;text-decoration:none;",
            lineSpaceStyle: "margin-top:15px;",
            btnSpaceStyle: "margin-top:10px;"
        }

        this.SendMail(email,
            "איפוס סיסמא",
            "<div>" + GetTimeBlessing(name) +
            "הקוד שהונפק עבורך לאיפוס הסיסמא הוא:</div><div {{resetCodeStyle}}>" +
            code + "</div><br>" +
            "<div {{lineSpaceStyle}}>או לחילופין, לחיצה על הכפתור:</div>" +
            "<div {{btnSpaceStyle}}><a href='" + resetAddress +
            "' {{linkStyle}}>שינוי סיסמא</a></div>",
            css);
    },

    ChangePasswordMail(email, name, resetAddress) {
        let css = {
            linkStyle: "padding:7px 16px;border:solid 1px #344c80;background:#547da0;border-radius:2px;color:white;text-decoration:none;",
            btnSpaceStyle: "margin-top:10px;"
        }

        this.SendMail(email,
            "שינוי סיסמא",
            "<div>" + GetTimeBlessing(name) +
            "לשינוי הסיסמא - יש ללחוץ על הפתור:</div>" +
            "<div {{btnSpaceStyle}}><a href='" +
            resetAddress + "' {{linkStyle}}>שינוי סיסמא</a></div>",
            css);
    },

    MessageNotificationAlert(email, name, senderName) {
        let text = GetTimeBlessing(name) +
            "ממתינה עבורך הודעה חדשה<name>." + "<br>" +
            config.address.site;
        text = senderName ? text.replace("<name>", " מ" + senderName) : text.replace("<name>", '');

        this.SendMail(email,
            "הודעה חדשה",
            text);
    },

    FriendRequestAlert(email, name, friendName, friendId) {
        let friendProfilePageUrl = config.address.site + "/profile/" + friendId;
        this.SendMail(email,
            "בקשת חברות",
            GetTimeBlessing(name) +
            "בקשת חברות חדשה הגיעה מ" + friendName + ".<br>" +
            friendProfilePageUrl);
    },

    FriendRequestConfirm(email, name, friendName) {
        this.SendMail(email,
            "אישור בקשת חברות",
            GetTimeBlessing(friendName) +
            "החברות עם " + name + " אושרה.<br>" +
            config.address.site);
    },

    BlockMessage(email, name, reason, date) {
        let dateString;

        if (date) {
            dateString = "עד לתאריך: ";
            date = FormatDate(date);
        }
        else {
            dateString = "לתקופה בלתי מוגבלת";
            date = '';
        }

        this.SendMail(email,
            "חסימת משתמש",
            GetTimeBlessing(name) +
            "חשבונך באתר נחסם לשימוש.<br><br>" +
            "סיבת החסימה: " + reason + "<br>" +
            dateString + "<b>" + date + "</b>");
    },

    ValidateDeleteUser(email, name, deleteUserLink) {
        let css = {
            linkStyle: "padding:7px 16px;border:solid 1px #f10000;background:#f44336;border-radius:2px;color:white;text-decoration:none;",
            btnSpaceStyle: "margin-top:10px;"
        }

        this.SendMail(email,
            "אישור מחיקת חשבון",
            "<div>" + GetTimeBlessing(name) +
            "למחיקת החשבון לצמיתות - יש ללחוץ על הפתור:</div>" +
            "<div {{btnSpaceStyle}}><a href='" +
            deleteUserLink + "' {{linkStyle}}>מחיקת משתמש</a></div>",
            css);
    },
};

function FormatDate(date) {
    date = new Date(date);
    return (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
}

function GetTimeBlessing(name) {
    let hour = new Date().getHours();
    let blessingStr;

    if (hour >= 5 && hour < 12) {
        blessingStr = "בוקר טוב";
    }
    else if (hour >= 12 && hour < 15) {
        blessingStr = "צהריים טובים";
    }
    else if (hour >= 15 && hour < 17) {
        blessingStr = "אחר הצהריים טובים";
    }
    else if (hour >= 17 && hour < 21) {
        blessingStr = "ערב טוב";
    }
    else {
        blessingStr = "לילה טוב";
    }

    return blessingStr + " " + name + ",<br>";
}

function ReplaceStyleCss(html, css) {
    Object.keys(css).forEach(className => {
        html = html.replace(new RegExp("{{" + className + "}}", 'g'), 'style="' + css[className] + '"');
    });

    return html;
}