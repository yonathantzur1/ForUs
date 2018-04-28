const jwt = require('jsonwebtoken');
const config = require('./config.js');
const encryption = require('./encryption.js');
const enums = require('./enums');

module.exports = {

    GetTokenFromUserObject: function (user) {
        var tokenUserObject = {
            "_id": user._id,
            "uid": user.uid,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "creationDate": user.creationDate,
            "profile": user.profile,
            "friends": user.friends,
            "permissions": user.permissions
        }

        var tokenObject = { "user": tokenUserObject };
        var token = encryption.encrypt(jwt.sign(tokenObject, config.jwt.secret, config.jwt.options));

        return token;
    },

    DecodeToken: function (token) {
        try {
            return jwt.verify(encryption.decrypt(token), config.jwt.secret);
        }
        catch (err) {
            return null;
        }
    },

    SetTokenOnCookie: function (token, res, isDisableUidCookieUpdate) {
        res.cookie(config.token.cookieName, token, { maxAge: config.token.maxAge, httpOnly: true });

        var token = this.DecodeToken(token);

        if (token.user && !isDisableUidCookieUpdate) {
            res.cookie(config.token.uidCookieName, token.user.uid, { maxAge: config.token.maxAge, httpOnly: false });
        }
    },

    DeleteTokenFromCookie: function (res) {
        res.clearCookie(config.token.cookieName);
    },

    DeleteUserIdFromCookie: function (res) {
        res.clearCookie(config.token.uidCookieName);
    },

    DeleteAuthCookies: function (res) {
        this.DeleteTokenFromCookie(res);
        this.DeleteUserIdFromCookie(res);
    },

    GetCookieByName: function (cname, cookie) {
        if (!cookie) {
            return "";
        }

        var name = cname + "=";
        var ca = cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];

            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return "";
    },

    GetTokenFromCookie: function (cookie) {
        return this.GetCookieByName(config.token.cookieName, cookie);
    },

    GetTokenFromSocket: function (socket) {
        return this.GetCookieByName(config.token.cookieName, socket.request.headers.cookie);
    },

    GetTokenFromRequest: function (request) {
        return this.GetCookieByName(config.token.cookieName, request.headers.cookie);
    },

    GetUidFromRequest: function (request) {
        return this.GetCookieByName(config.token.uidCookieName, request.headers.cookie);
    },

    GenerateId: function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    },

    GetIpFromRequest: function (request) {
        var ip = request.ip;

        if (ip) {
            var reqestIpParts = ip.split("::");

            if (reqestIpParts && reqestIpParts.length > 0) {
                return reqestIpParts[reqestIpParts.length - 1];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },

    IsUserHasMasterPermission(permissions) {
        if (!permissions || permissions.length == 0) {
            return false;
        }
        else {
            return (permissions.indexOf(enums.PERMISSION.MASTER) != -1);
        }
    },

    IsUserHasRootPermission(permissions) {
        if (!permissions || permissions.length == 0) {
            return false;
        }
        else {
            return ((permissions.indexOf(enums.PERMISSION.MASTER) != -1) ||
                (permissions.indexOf(enums.PERMISSION.ADMIN) != -1));
        }
    }
}