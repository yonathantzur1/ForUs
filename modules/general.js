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
        var token = encryption.encrypt(jwt.sign(tokenObject, config.jwtSecret, config.jwtOptions));

        return token;
    },

    DecodeToken: function (token) {
        return encryption.decrypt(token);
    },

    GetCookieFromReq: function (cname, decodedCookie) {
        if (!decodedCookie) {
            return "";
        }

        var name = cname + "=";
        var ca = decodedCookie.split(';');

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

    GenerateId: function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }
}