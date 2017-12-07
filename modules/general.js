var jwt = require('jsonwebtoken');
var config = require('../modules/config.js');
var encryption = require('../modules/encryption.js');

module.exports = {
    GetTokenFromUserObject: function (user) {
        var tokenUserObject = {
            "_id": user._id,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "creationDate": user.creationDate,
            "profile": user.profile,
            "friends": user.friends
        }

        var tokenObject = { "user": tokenUserObject };
        var token = encryption.encrypt(jwt.sign(tokenObject, config.jwt.secret, config.jwt.options));

        return token;
    },

    DecodeToken: function (token) {
        return encryption.decrypt(token);
    },

    SetTokenOnCookie: function (token, res) {
        res.cookie(config.token.cookieName, token, { maxAge: config.token.maxAge, httpOnly: true });
    },

    DeleteTokenFromCookie: function (res) {
        res.clearCookie(config.token.cookieName);
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

    GenerateId: function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
}