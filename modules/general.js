const jwt = require('jsonwebtoken');
const config = require('./config.js');
const encryption = require('./encryption.js');
const enums = require('./enums');

var self = module.exports = {

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
        var token = encryption.encrypt(jwt.sign(tokenObject, config.security.jwt.secret, config.security.jwt.options));

        return token;
    },

    DecodeToken: function (token) {
        try {
            return jwt.verify(encryption.decrypt(token), config.security.jwt.secret);
        }
        catch (err) {
            return null;
        }
    },

    SetTokenOnCookie: function (token, res, isDisableUidCookieUpdate) {
        res.cookie(config.security.token.cookieName, token, { maxAge: config.security.token.maxAge, httpOnly: true });

        var token = this.DecodeToken(token);

        if (token.user && !isDisableUidCookieUpdate) {
            res.cookie(config.security.token.uidCookieName, token.user.uid, { maxAge: config.security.token.maxAge, httpOnly: false });
        }
    },

    DeleteTokenFromCookie: function (res) {
        res.clearCookie(config.security.token.cookieName);
    },

    DeleteUserIdFromCookie: function (res) {
        res.clearCookie(config.security.token.uidCookieName);
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
        return this.GetCookieByName(config.security.token.cookieName, cookie);
    },

    GetTokenFromSocket: function (socket) {
        return this.GetCookieByName(config.security.token.cookieName, socket.request.headers.cookie);
    },

    GetTokenFromRequest: function (request) {
        return this.GetCookieByName(config.security.token.cookieName, request.headers.cookie);
    },

    GetUidFromRequest: function (request) {
        return this.GetCookieByName(config.security.token.uidCookieName, request.headers.cookie);
    },

    GenerateId: function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    },

    GetIpFromRequest: function (request) {
        var ip = request.ip;

        return self.CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromRequest: function (request) {
        return request.headers["user-agent"];
    },

    GetIpFromSocket: function (socket) {
        var ip = socket.handshake.address;

        return self.CutIpAddressStringPrefix(ip);
    },

    GetUserAgentFromSocket: function (socket) {
        return socket.request.headers["user-agent"];
    },

    IsUserHasMasterPermission(permissions) {
        if (!permissions || permissions.length == 0) {
            return false;
        }
        else {
            return (permissions.indexOf(enums.PERMISSION.MASTER) != -1);
        }
    },

    IsUserHasAdminPermission(permissions) {
        if (!permissions || permissions.length == 0) {
            return false;
        }
        else {
            return (permissions.indexOf(enums.PERMISSION.ADMIN) != -1);
        }
    },

    IsUserHasRootPermission(permissions) {
        return (self.IsUserHasAdminPermission(permissions) ||
            self.IsUserHasMasterPermission(permissions));
    },

    CutIpAddressStringPrefix(ip) {
        if (ip) {
            var realIpStringPartStartIndex = ip.lastIndexOf(":") + 1;
            return ip.substring(realIpStringPartStartIndex);
        }
        else {
            return null;
        }
    }
}