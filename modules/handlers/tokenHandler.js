const jwt = require('jsonwebtoken');
const config = require('../../config');
const encryption = require('../security/encryption');

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

    DecodeTokenFromRequest: function (request) {
        var token = this.GetTokenFromRequest(request);
        return this.DecodeToken(token);
    },

    DecodeTokenFromSocket: function (socket) {
        var token = this.GetTokenFromSocket(socket);
        return this.DecodeToken(token);
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

    GetTokenFromCookie: function (cookie) {
        return GetCookieByName(config.security.token.cookieName, cookie);
    },

    GetTokenFromSocket: function (socket) {
        return GetCookieByName(config.security.token.cookieName, socket.request.headers.cookie);
    },

    GetTokenFromRequest: function (request) {
        return GetCookieByName(config.security.token.cookieName, request.headers.cookie);
    },

    GetUidFromRequest: function (request) {
        return GetCookieByName(config.security.token.uidCookieName, request.headers.cookie);
    }
}

function GetCookieByName(cname, cookie) {
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
}